// ConversationSkeleton.jsx
import React from 'react';

export default function ConvSpinner() {
  return (
    <div className="space-y-3  p-4 w-80">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 animate-pulse bg-white dark:bg-gray-800 p-3 rounded-lg shadow"
        >
          {/* Profile circle */}
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>

          {/* Text lines */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

