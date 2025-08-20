import {
  Header,
  Sidebar,
  ChatList,
  ChatInput,
  ChatHeader,
} from "../components";
export function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatHeader />
          <ChatList />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
