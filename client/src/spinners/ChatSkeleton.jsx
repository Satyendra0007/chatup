import React from "react";

export default function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"
            }`}
        >
          {i % 2 === 0 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
          )}
          <div className="space-y-2">
            <div className="h-3 w-32 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-3 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          {i % 2 !== 0 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
          )}
        </div>
      ))}
    </div>
  );
};


