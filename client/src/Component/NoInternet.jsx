import React from 'react';

export default function NoInternet() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800">
      <svg className="w-16 h-16 mb-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M1 1l22 22M16.72 11.06a6 6 0 00-9.44 0M3.1 5a12 12 0 0117.8 0M9.17 13.13a2 2 0 012.66 0M12 20h.01" />
      </svg>
      <h2 className="text-xl font-semibold">No Internet Connection</h2>
      <p className="text-sm text-gray-600">Please check your network and try again.</p>
    </div>
  );
};

