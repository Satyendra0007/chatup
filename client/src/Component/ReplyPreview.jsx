import { motion } from "motion/react";

/**
 * ReplyPreview — rendered inside a Chat bubble at the top.
 * Clicking it scrolls to and briefly highlights the original message.
 */
export default function ReplyPreview({ replyTo, isUser, members, currentUserId, onScrollToMessage }) {
  if (!replyTo?.messageId) return null;

  const isDeleted = !replyTo.text;
  const isOwnReply = replyTo.senderId === currentUserId;

  // Resolve sender display name
  const senderName = (() => {
    if (isOwnReply) return "You";
    const member = members?.find(m => m.id === replyTo.senderId);
    return member?.firstName || "User";
  })();

  // Accent colors: left bar color depends on ownership
  const barColor = isUser ? "bg-white/40" : "bg-[var(--accent)]/60";
  const bgColor  = isUser ? "bg-white/15" : "bg-[var(--accent)]/8";
  const nameColor = isUser ? "text-white/90" : "text-[var(--accent)]";
  const textColor = isUser ? "text-white/65" : "text-[var(--text-secondary)]";

  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.8 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ originY: 0 }}
      onClick={(e) => {
        e.stopPropagation();
        onScrollToMessage?.(replyTo.messageId?.toString());
      }}
      className={`flex gap-1.5 rounded-lg mb-1 px-2 py-1 cursor-pointer ${bgColor} border-l-2 ${isUser ? "border-white/50" : "border-[var(--accent)]"} overflow-hidden select-none`}
    >
      <div className="flex flex-col min-w-0">
        <span className={`text-[9px] font-semibold leading-tight truncate ${nameColor}`}>
          {senderName}
        </span>
        <span className={`text-[9px] leading-snug truncate max-w-[160px] ${textColor}`}>
          {isDeleted ? (
            <span className="italic opacity-70">This message is no longer available.</span>
          ) : (
            replyTo.text
          )}
        </span>
      </div>
    </motion.div>
  );
}
