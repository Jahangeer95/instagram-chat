export function formatDate (dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString();
  };

  export function groupMessagesByDate (messages) {
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.created_time) - new Date(b.created_time)
    );

    const groups = {};
    for (const msg of sortedMessages) {
      const dateLabel = formatDate(msg.created_time);
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(msg);
    }
    return groups;
  };