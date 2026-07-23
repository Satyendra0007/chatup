import { motion, AnimatePresence } from "motion/react";
import { IoClose } from "react-icons/io5";
import { slideInBottom } from "@/utils/animations";

/**
 * ReplyComposer — shown above the message input when replyingTo is set.
 * Provides a WhatsApp-style preview of the message being replied to.
 */
export default function ReplyComposer({ replyingTo, onCancel, currentUserId, members }) {
  if (!replyingTo) return null;

  const isOwnMessage = replyingTo.senderId === currentUserId;
  const senderName = (() => {
    if (isOwnMessage) return "You";
    const member = members?.find(m => m.id === replyingTo.senderId);
    return member?.firstName || "User";
  })();

  return (
    <motion.div
      {...slideInBottom}
      className="mb-1.5 mx-1 flex items-center gap-2 bg-[var(--bg-active)] border border-[var(--border-soft)] rounded-xl px-3 py-1.5 shadow-[var(--shadow-xs)] overflow-hidden"
    >
      {/* Accent bar */}
      <div className="w-0.5 h-full self-stretch bg-[var(--accent)] rounded-full flex-shrink-0" />

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-semibold text-[var(--accent-dark)] leading-tight">
          Replying to {senderName}
        </span>
        <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-[220px] leading-snug">
          {replyingTo.text}
        </span>
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="flex-shrink-0 p-1 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        aria-label="Cancel reply"
      >
        <IoClose className="text-base" />
      </button>
    </motion.div>
  );
}
