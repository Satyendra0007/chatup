import { Outlet } from 'react-router-dom';
import Conversations from './Conversations';

export default function ChatLayout() {
  return (
    // h-full fills the App.jsx shell (var(--app-h)) — never independently sets a height
    <div className="h-full flex overflow-hidden">
      {/* Mobile: show only the active child route */}
      <div className="md:hidden h-full w-full">
        <Outlet />
      </div>

      {/* Desktop: side-by-side split layout */}
      <div className="hidden md:flex h-full w-full overflow-hidden">
        <div className="left md:relative flex-shrink-0">
          <Conversations />
        </div>
        <div className="right flex-1 min-w-0 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
