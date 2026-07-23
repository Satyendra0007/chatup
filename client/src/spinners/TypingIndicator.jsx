import React from "react";
import { motion } from "motion/react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 px-1">
      <div className="bg-[var(--bubble-in-bg)] border border-[var(--border-medium)] rounded-2xl rounded-tl-[4px] px-3 py-2 md:py-2.5 max-w-max shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <motion.div 
          variants={{
            animate: { transition: { staggerChildren: 0.15 } }
          }}
          initial="initial"
          animate="animate"
          className="flex items-center space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i}
              variants={{
                initial: { y: 0, opacity: 0.5 },
                animate: { 
                  y: [0, -4, 0], 
                  opacity: [0.5, 1, 0.5],
                  transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } 
                }
              }}
              className="w-1.5 h-1.5 bg-[var(--accent)]/60 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
