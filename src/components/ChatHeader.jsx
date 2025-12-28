import Avatar from "react-avatar";
export function ChatHeader({ user }) {
  return (
    <div className="bg-gradient-to-l from-Purple via-Red to-Orange text-white p-3 text-lg font-medium">
      <Avatar
        name={user?.username || "Unknown"}
        size="35"
        round={true}
        className="mr-2"
      />
      {user?.username || "Select a user"}
    </div>
  );
}
