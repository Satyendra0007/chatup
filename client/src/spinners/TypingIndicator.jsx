import React from "react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 px-1">
      <div className="bg-[var(--bubble-in-bg)] border border-[var(--border-medium)] rounded-2xl rounded-tl-[4px] px-3 py-2 md:py-1.5 max-w-max shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-[var(--accent)]/60 rounded-full animate-bounce [animation-delay:0s]"></div>
          <div className="w-1.5 h-1.5 bg-[var(--accent)]/60 rounded-full animate-bounce [animation-delay:0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-[var(--accent)]/60 rounded-full animate-bounce [animation-delay:0.3s]"></div>
        </div>
      </div>
    </div>
  );
};
