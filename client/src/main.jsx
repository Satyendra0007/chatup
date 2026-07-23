import './index.css'
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import ConversationsWrapper from './Context/ConversationsStore'
import useOnlineStatus from './hooks/useOnlineStatus'
import { Toaster } from 'react-hot-toast'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// ── Global viewport height system ────────────────────────────────────────────
// Updates --app-h on <body> to match the currently visible browser viewport.
// visualViewport is the most accurate source on mobile (it accounts for the
// dynamic address bar and the virtual keyboard).
// We update on both 'resize' and 'scroll' events because some browsers
// (notably Chrome Android) fire 'scroll' when the address bar collapses.
const setAppHeight = () => {
  const h = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;
  document.body.style.setProperty('--app-h', `${h}px`);
};

// Run once immediately so the first paint is correct
setAppHeight();

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setAppHeight);
  window.visualViewport.addEventListener('scroll', setAppHeight);
} else {
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
}
// ─────────────────────────────────────────────────────────────────────────────

const Root = () => {
  return (
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/"  >
        <ConversationsWrapper>
          <BrowserRouter>
            <Toaster
              position="top-center"
              reverseOrder={false}
            />
            <App />
          </BrowserRouter>
        </ConversationsWrapper>
      </ClerkProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />)
