import {
  Header,
  Sidebar,
  ChatList,
  ChatInput,
  ChatHeader,
} from "../components";
import { useEffect, useState, useRef } from "react";
import {
  fetchAllParticipants,
  fetchMessages,
  sendMessage,
} from "../api/InstaApi";
import { io } from "socket.io-client";
import { baseURL, INSTA_PAGE_ID } from "../config";
const socket = io(baseURL, { transports: ["websocket"] });
export function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [paging, setPaging] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [afterCursor, setAfterCursor] = useState("");
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const selectedRef = useRef(null);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // load conversations
  async function loadConversations(cursor = "") {
    const { participants, paging } = await fetchAllParticipants(cursor);

    const more = participants.map((conv) => {
      return {
        conversationId: conv.conversationId || conv.id,
        participants: conv.participants,
      };
    });

    setConversations((prev) => {
      const map = new Map();

      [...prev, ...more].forEach((item) => {
        map.set(item.conversationId, item);
      });

      return Array.from(map.values());
    });

    if (paging?.next) {
      const next = new URL(paging.next).searchParams.get("after");
      setAfterCursor(next);
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selected?.conversationId) return;

      const { messages: fetchedMessages, paging } = await fetchMessages(
        selected.conversationId
      );
      console.log("Fetched messages:", fetchedMessages);
      setMessages(
        fetchedMessages
          .reverse()
          .sort((a, b) => new Date(a.created_time) - new Date(b.created_time))
      );
      setPaging(paging);
      setHasMoreMessages(!!paging?.next);
    };

    loadMessages();
  }, [selected]);

  useEffect(() => {
    window.socket = socket;

    socket.on("connect", () => console.log("Connected:", socket.id));
    socket.on("disconnect", () => console.log("Disconnected"));

    // refresh messages when a new message arrives
    socket.on("message_from_user", async () => {
      console.log("Message from user");
      try {
        if (selectedRef.current?.conversationId) {
          const { messages: updatedMessages, paging } = await fetchMessages(
            selectedRef.current.conversationId
          );
          setMessages(
            [...updatedMessages]
              .reverse()
              .sort(
                (a, b) => new Date(a.created_time) - new Date(b.created_time)
              )
          );
          setPaging(paging);
        }
        await loadConversations();
      } catch (err) {
        console.error("Failed to refresh messages:", err);
      }
    });

    // message reaction
    socket.on("message_reaction", (reactions) => {
      reactions.forEach(({ messageId, reaction: emoji, senderId, action }) => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              let existing = msg.reactions || [];

              if (action === "react") {
                // add reaction if not already present
                const alreadyReacted = existing.some(
                  (r) => r.senderId === senderId && r.emoji === emoji
                );
                if (!alreadyReacted) {
                  existing = [...existing, { senderId, emoji }];
                }
              } else if (action === "unreact") {
                // remove reaction
                existing = existing.filter(
                  (r) => !(r.senderId === senderId && r.emoji === emoji)
                );
              }

              return { ...msg, reactions: existing };
            }
            return msg;
          })
        );
      });
    });

    socket.onAny((ev, ...args) => console.log("Event:", ev, args));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message_from_user");
      socket.off("message_react");
      socket.offAny();
    };
  }, []);

  const handleSendMessage = async ({ text, file, type }) => {
    if (!selected) {
      console.warn("No conversation selected");
      return;
    }

    const recipient = selected?.user;
    if (!recipient?.id) {
      console.warn("No recipient found in selected conversation:", selected);
      return;
    }

    const tempId = Date.now().toString();

    const newMsg = {
      id: tempId,
      message: type === "text" ? text : file?.name,
      from: { id: INSTA_PAGE_ID },
      created_time: new Date().toISOString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMsg]);

    console.log("Recipient:", recipient);
    console.log("Message type:", type);
    if (type === "text") console.log("Text content:", text);
    if (type === "file") console.log("File to send:", file);

    try {
      const msgType = file ? "file" : "text";

      const response = await sendMessage({
        recipientId: recipient.id,
        text,
        file,
        type: msgType,
      });

      console.log("Message sent successfully. Response:", response);
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const handlepreviousMessages = async () => {
    if (!paging?.next || !selected?.conversationId) {
      setHasMoreMessages(false);
      return;
    }

    const afterCursor = new URL(paging.next).searchParams.get("after");
    if (!afterCursor) {
      setHasMoreMessages(false);
      return;
    }

    const { messages: olderMessages, paging: newPaging } = await fetchMessages(
      selected.conversationId,
      afterCursor
    );

    setMessages((prev) => {
      const combined = [...olderMessages, ...prev];
      const uniqueMap = new Map();
      combined.forEach((msg) => {
        uniqueMap.set(msg.id, { ...msg, status: msg.status || "sent" });
      });

      return [...uniqueMap.values()].sort(
        (a, b) => new Date(a.created_time) - new Date(b.created_time)
      );
    });

    setPaging(newPaging);
    setHasMoreMessages(!!newPaging?.next);
  };


  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          users={conversations}
          onSelect={setSelected}
          selectedId={selected?.conversationId}
          onLoadMore={() => loadConversations(afterCursor)}
          hasMore={hasMore}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatHeader user={selected?.user} />
          {selected?.user ? (
            <ChatList
              messages={messages}
              onLoadMore={handlepreviousMessages}
              hasMore={hasMoreMessages}
            />
          ) : (
            <div className="flex flex-1 m-auto pt-60 ">
              Select a user to view messages
            </div>
          )}
          <ChatInput onSend={handleSendMessage} disabled={!selected} />
        </div>
      </div>
    </div>
  );
}
