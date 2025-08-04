
import React from "react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2">
      <div className="bg-gray-300 rounded-full px-5 py-3 md:py-2.5 max-w-max">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0s]"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.15s]"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.3s]"></div>
        </div>
      </div>
    </div>
  );
};

