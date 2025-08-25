import { useState } from "react";
import { INSTA_PAGE_ID } from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
export function ChatMessage({ message }) {
  const isUser = message.from?.id === INSTA_PAGE_ID;
  const time = new Date(message.created_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const attachment = message.attachments?.data?.[0];
  const imageUrl = attachment?.image_data?.url;

  const messageContent = () => {
    //to handle attachment message
    if (attachment) {
      if (imageUrl) {
        return (
          <div>
            {!imageLoaded && (
              <span className="text-gray-500">Loading image...</span>
            )}
            <img
              src={imageUrl}
              alt={attachment.name || "Image"}
              className={`max-w-[300px] max-h-[300px] rounded-lg ${
                imageLoaded ? "block" : "hidden"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(false);
                console.warn("Image failed to load");
              }}
            />
          </div>
        );
      } else {
        return <span>{attachment.name || "Attachment received"}</span>;
      }
    }

    //to handle text message
    if (message.message && typeof message.message === "string") {
      return <span>{message.message}</span>;
    }

    //to handle sticker message
    if (message.sticker) {
      return (
        <img
          src={message.sticker}
          alt="sticker"
          className="max-w-[120px] rounded-lg"
          onError={() => console.warn("Sticker failed to load")}
        />
      );
    }
    return null;
  };

  const messageStatus = () => {
    if (!isUser) return null;

    let icon = faCheck;
    let color = "text-gray-400";

    if (message.status === "delivered") {
      icon = faCheckDouble;
      color = "text-gray-400";
    } else if (message.status === "read") {
      icon = faCheckDouble;
      color = "text-blue-400";
    }

    return <FontAwesomeIcon icon={icon} className={`ml-1 text-xs ${color}`} />;
  };
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} my-2 px-2`}
    >
      <div
        className={`relative px-4 py-2 rounded-lg shadow-md max-w-[75%] ${
          isUser ? "bg-blue-100 text-right" : "bg-white"
        }`}
      >
        {messageContent()}
        <div className="flex justify-end items-center text-xs text-gray-500 mt-1">
          <span>{time}</span>
          {messageStatus()}
        </div>
      </div>
    </div>
  );
}
