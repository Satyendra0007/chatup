export default function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm z-50">
      <div className="relative w-20 h-20">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-400 border-t-green-500 animate-spin shadow-[0_0_15px_rgba(99,102,241,0.7)]"></div>

        {/* Inner Ring */}
        <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-green-400 animate-[spin_2s_linear_infinite_reverse] shadow-[0_0_10px_rgba(129,140,248,0.6)]"></div>

        {/* Center Glow */}
        <div className="absolute inset-6 rounded-full bg-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.9)]"></div>
      </div>

      {/* Loading text */}
      <span className="absolute bottom-20 text-gray-200 text-lg tracking-wide animate-pulse">
        Loading...
      </span>
    </div>
  );
}
