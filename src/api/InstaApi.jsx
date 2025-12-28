import {
  baseURL,
  FB_PAGE_ID,
  INSTAGRAM_ACCESS_TOKEN,
  INSTA_PAGE_ID,
} from "../config";
// for getting participants
export const fetchAllParticipants = async (after = "") => {
  const url = new URL(`${baseURL}/instagram/participants`);
  if (after) url.searchParams.append("after", after);

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      INSTAGRAM_ACCESS_TOKEN: INSTAGRAM_ACCESS_TOKEN,
      FB_PAGE_ID: FB_PAGE_ID,
      INSTAGRAM_ACCOUNT_ID: INSTA_PAGE_ID,
    },
  });

  const data = await res.json();
  const participants = data?.data?.participants || [];
  const paging = data?.data?.paging || null;

  return { participants, paging };
};

//fetch conversations
export const fetchMessages = async (conversationId, afterCursor = "") => {
  try {
    const url = new URL(`${baseURL}/instagram/conversations/${conversationId}`);
    if (afterCursor) {
      url.searchParams.append("after", afterCursor);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        INSTAGRAM_ACCESS_TOKEN: INSTAGRAM_ACCESS_TOKEN,
        FB_PAGE_ID: FB_PAGE_ID,
        INSTAGRAM_ACCOUNT_ID: INSTA_PAGE_ID,
      },
    });

    const responseData = await res.json();

    if (!responseData.success || !responseData.data) {
      return { messages: [], paging: null,instaUser:null };
    }

    const { messages = [], paging = null,instaUser=null } = responseData.data;

    console.log("Fetched messages:", {
      messages,
      paging,
      instaUser,
      type: typeof messages,
    });

    return { messages, paging,instaUser };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], paging: null ,instaUser:null};
  }
};

export const sendMessage = async ({ recipientId, text, file, type }) => {
  try {
    const url = `${baseURL}/instagram/send-message`;

    console.log("Recipient ID:", recipientId);
    console.log("Type:", type);
    if (type === "text") console.log("Text message:", text);
    if (type === "file") console.log("File to send:", file);

    const formData = new FormData();
    formData.append("recipientId", recipientId);
    formData.append("type", type);

    if (type === "text") {
      formData.append("message", text);
    } else if (type === "file" && file) {
      formData.append("file", file, file.name);
    }

    console.log("Sending request to", url);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        INSTAGRAM_ACCESS_TOKEN,
        FB_PAGE_ID,
        INSTAGRAM_ACCOUNT_ID: INSTA_PAGE_ID,
      },
      body: formData,
    });

    console.log("Response status", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response", errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("Response data", data);
    return data;
  } catch (err) {
    console.error("sendMessage error", err);
    throw err;
  }
};
