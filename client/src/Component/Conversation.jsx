import { useNavigate } from "react-router-dom";
import userimage from "../assets/user.png";
import { useUser } from "@clerk/clerk-react";
import { useConversationsStore } from "@/Context/ConversationsStore";

export default function Conversation({
  name,
  conversationId,
  receiverId,
  imageUrl,
  email,
  lastMessage,
  unreadBy,
  selectedConversation,
  setSelectedConversation,
  isGroup,
  groupAdmin,
  members,
}) {
  const { user } = useUser();
  const { onlineUsers } = useConversationsStore();
  const navigate = useNavigate();
  const isUnread = unreadBy?.includes(user?.id);
  const isSelected = conversationId === selectedConversation;
  const isOnline = !isGroup && onlineUsers?.includes(receiverId);

  const handleOnClick = (conversationId) => {
    let data;
    if (isGroup) {
      data = { groupAdmin, members };
    } else {
      data = { receiverId, imageUrl, email };
    }
    navigate(`/chatlayout/chats`, {
      state: { ...data, convid: conversationId, lastMessage, isGroup, name },
    });
    setSelectedConversation(conversationId);
  };

  const formatTime = (ms) => {
    if (!ms) return "";
    const date = new Date(ms);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString("en-IN", { weekday: "short" });
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const lastMessagePreview = () => {
    if (!lastMessage?.text) return <span className="italic" style={{ color: 'var(--text-muted)' }}>No messages yet</span>;
    const isMine = lastMessage?.senderId === user?.id;
    return (
      <span style={{ color: isUnread ? 'var(--accent-dark)' : 'var(--text-secondary)' }}
        className={isUnread ? "font-medium" : ""}>
        {isMine && <span style={{ color: 'var(--text-muted)' }} className="font-normal">You: </span>}
        {lastMessage.text}
      </span>
    );
  };

  return (
    <div
      onClick={() => handleOnClick(conversationId)}
      className={`group flex items-center w-full md:w-80 px-3 py-2 md:py-1.5 cursor-pointer transition-all duration-150 border-l-2 ${
        isSelected
          ? "border-l-[var(--accent)] bg-[var(--bg-active)]/40"
          : "border-l-transparent hover:bg-[var(--bg-hover)]/60"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0 mr-3">
        <img
          className={`w-10 h-10 rounded-full object-cover transition-all duration-150 ${
            isSelected
              ? "ring-2 ring-offset-1 ring-[var(--accent)]/60"
              : "ring-1 ring-black/[0.08]"
          }`}
          src={imageUrl || userimage}
          alt={name}
        />
        {isOnline && (
          <span className="online-ring absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white" />
        )}
        {isUnread && !isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ backgroundColor: 'var(--accent)' }} />
        )}
      </div>

      {/* Text content */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`text-[13px] font-semibold capitalize truncate leading-tight ${isSelected ? "" : ""}`}
            style={{ color: isSelected ? 'var(--accent-dark)' : 'var(--text-primary)' }}
          >
            {name}
          </h3>
          {lastMessage?.time && (
            <span
              className="text-[10px] flex-shrink-0 tabular-nums leading-none"
              style={{ color: isUnread ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isUnread ? 600 : 400 }}
            >
              {formatTime(lastMessage.time)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="text-[11px] md:text-[10px] truncate max-w-[160px] leading-tight">
            {lastMessagePreview()}
          </p>
          {isUnread && (
            <span
              className="flex-shrink-0 h-4 min-w-4 px-1 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              ●
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
