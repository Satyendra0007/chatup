// Centralized Framer Motion (Motion) variants for ChatUp
// Import motion from 'motion/react' as per latest API

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2, ease: "easeOut" }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const staggerItemFadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const popIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

export const slideInRight = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, x: '100%', transition: { duration: 0.2 } }
};

export const messageAppear = (isUser) => ({
  initial: { opacity: 0, scale: 0.95, y: 10, originX: isUser ? 1 : 0, originY: 1 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
});

export const hoverScale = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 10 }
};

export const tapScale = {
  scale: 0.95
};

export const reactionPop = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 500, damping: 15 } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.1 } }
};

export const tickTransition = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 20 } }
};

export const slideInBottom = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } }
};
