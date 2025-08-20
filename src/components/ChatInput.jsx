export function ChatInput() {
  return (
    <div className="p-4 bg-gray-100 border-t">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded disabled:bg-gray-200"
        />
        <button className="px-4 py-2  bg-red-400 text-white rounded hover:bg-orange-400 disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}
