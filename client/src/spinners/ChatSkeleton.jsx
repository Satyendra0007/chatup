import React from "react";

export default function ChatSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`flex items-end gap-2 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          {i % 2 === 0 && (
            <div className="w-6 h-6 rounded-full shimmer flex-shrink-0"></div>
          )}
          <div className="space-y-1">
            <div
              className={`h-8 shimmer rounded-2xl ${i % 2 === 0 ? "rounded-tl-sm" : "rounded-tr-sm"}`}
              style={{ width: `${80 + (i * 17) % 80}px` }}
            ></div>
            <div className={`h-2 w-10 shimmer rounded ${i % 2 === 0 ? "" : "ml-auto"}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
