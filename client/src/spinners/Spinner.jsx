export default function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-page)]/50 backdrop-blur-sm z-50">
      <div className="relative w-20 h-20">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[var(--border-medium)] border-t-[var(--accent)] animate-spin shadow-[var(--shadow-sm)]"></div>

        {/* Inner Ring */}
        <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-[var(--accent-muted)] animate-[spin_2s_linear_infinite_reverse]"></div>

        {/* Center Glow */}
        <div className="absolute inset-6 rounded-full bg-[var(--accent-dark)] shadow-[var(--shadow-md)]"></div>
      </div>

      {/* Loading text */}
      <span className="absolute bottom-20 text-[var(--text-secondary)] text-lg font-medium tracking-wide animate-pulse">
        Loading...
      </span>
    </div>
  );
}
