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
import { ToastContainer, toast } from "react-toastify";
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
        updatedTime: conv.updatedTime,
      };
    });

    setConversations((prev) => {
      const map = new Map();

      [...prev, ...more].forEach((item) => {
        map.set(item.conversationId, item);
      });

      return Array.from(map.values()).sort(
        (a, b) => new Date(b.updatedTime) - new Date(a.updatedTime)
      );
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
      try {
        const { messages: fetchedMessages, paging,instaUser } = await fetchMessages(
          selected.conversationId
        );
        console.log("Fetched messages:", fetchedMessages);
        setSelected((prev)=>({
          ...prev,instaUser
        }));
        setMessages(
          fetchedMessages
            .reverse()
            .sort((a, b) => new Date(a.created_time) - new Date(b.created_time))
        );
        setPaging(paging);
        setHasMoreMessages(!!paging?.next);
      } catch (err) {
        console.log("Failed to load messages", err);
        toast.error("Failed toload messages");
      }
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
        toast.error("Failed to load messages");
      }
    });

    // message reaction
    socket.on("message_reaction", (reactions) => {});

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
    // const lastMessageTime = selected?.instaUser?.last_message_time;
    // const now = Date.now();
    // const diffHours = (now - Number(lastMessageTime)) / (1000 * 60 * 60);

    // if (diffHours > 24) {
    //   toast.error("Cannot send: 24-hour window expired");
    //   return;
    // }
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
      toast.error("Send Failed");
    }
  };

  const handlepreviousMessages = async () => {
    if (!paging?.next || !selected?.conversationId) {
      setHasMoreMessages(false);
      return;
    }
    try {
      const afterCursor = new URL(paging.next).searchParams.get("after");
      if (!afterCursor) {
        setHasMoreMessages(false);
        return;
      }

      const { messages: olderMessages, paging: newPaging } =
        await fetchMessages(selected.conversationId, afterCursor);

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
    } catch (err) {
      console.log("Failed to load old messages", err);
      toast.error("Failed to load old messages");
    }
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
            <div className="flex flex-1 m-auto pt-60 text-black ">
              Select a user to start conversation
            </div>
          )}
          <ChatInput onSend={handleSendMessage} disabled={!selected} />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
