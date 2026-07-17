import React from 'react';

export default function ConvSpinner() {
  return (
    <div className="space-y-1 p-2 w-full">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border-b border-[var(--border-soft)]"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full shimmer flex-shrink-0"></div>
          {/* Text lines */}
          <div className="flex-1 space-y-1.5">
            <div className="h-3 shimmer rounded-full" style={{ width: `${50 + (i * 23) % 40}%` }}></div>
            <div className="h-2.5 shimmer rounded-full" style={{ width: `${30 + (i * 19) % 35}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
