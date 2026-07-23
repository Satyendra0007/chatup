import { useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { IoArrowUndoOutline } from "react-icons/io5";

const REPLY_THRESHOLD = 60; // px — distance to trigger reply

/**
 * SwipeToReply — wraps a chat message bubble for mobile swipe-to-reply.
 *
 * Key design:
 *   - Drag is constrained right-only (left=0, right=80)
 *   - dragDirectionLock: only horizontal swipes activate it, preserving vertical scroll
 *   - onReply fires ONCE when the threshold is crossed
 *   - The bubble ALWAYS springs back to x=0 when the finger is lifted (handleDragEnd)
 *   - We never call animate(x,0) while the drag is still active — that fights the gesture engine
 */
export default function SwipeToReply({ children, onReply, isMobile }) {
  const x = useMotionValue(0);
  const triggeredRef = useRef(false);

  // Icon opacity + scale tracks drag distance
  const iconOpacity = useTransform(x, [0, REPLY_THRESHOLD * 0.4, REPLY_THRESHOLD], [0, 0.5, 1]);
  const iconScale   = useTransform(x, [0, REPLY_THRESHOLD * 0.5, REPLY_THRESHOLD], [0.4, 0.75, 1]);

  const handleDrag = (_, info) => {
    // Fire reply once when threshold crossed — do NOT animate here, drag is still active
    if (info.offset.x >= REPLY_THRESHOLD && !triggeredRef.current) {
      triggeredRef.current = true;
      if (navigator.vibrate) navigator.vibrate(30);
      onReply?.();
    }
  };

  const handleDragEnd = () => {
    // Finger is lifted — now it is safe to animate back to 0 without fighting the gesture engine
    animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
    triggeredRef.current = false;
  };

  // On desktop, just render children without swipe wrapper
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Reply icon revealed behind the bubble */}
      <motion.div
        style={{ opacity: iconOpacity, scale: iconScale }}
        className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] pointer-events-none z-0"
      >
        <IoArrowUndoOutline className="text-base" />
      </motion.div>

      {/* Draggable bubble */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 80 }}
        dragElastic={{ left: 0, right: 0.15 }}
        style={{ x }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
