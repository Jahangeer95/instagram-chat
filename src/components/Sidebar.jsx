import { INSTA_PAGE_ID } from "../config";
import InfiniteScroll from "react-infinite-scroll-component";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Avatar from "react-avatar";

export function Sidebar({
  users = [],
  onSelect,
  selectedId,
  onLoadMore,
  hasMore,
}) {
  return (
    <div
      className="w-1/5 border-r overflow-auto bg-Yellow h-screen"
      id="scrollableSidebar"
    >
      <div className="p-4 font-bold text-lg border-b bg-gradient-to-r from-Purple to-Orange text-white">
        {" "}
        Contacts
      </div>
      <InfiniteScroll
        dataLength={users.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-2">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-red-400 text-lg"
            />
          </div>
        }
        scrollableTarget="scrollableSidebar"
      >
        {users.map((conv) => {
          const user = conv.participants?.find((p) => p.id !== INSTA_PAGE_ID);

          return (
            <div
              key={conv.conversationId}
              onClick={() =>
                onSelect({ conversationId: conv.conversationId, user })
              }
              className={`cursor-pointer px-4 py-3 border-b ${
                selectedId === conv.conversationId
                  ? "bg-red-200 bg-opacity-80"
                  : "hover:bg-red-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <Avatar
                  name={user?.username || "Unknown"}
                  size="35"
                  round={true}
                />
                <span className="font-bold">{user?.username || "Unknown"}</span>
              </div>
            </div>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}
