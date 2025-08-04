import './index.css'
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import ConversationsWrapper from './Context/ConversationsStore'
import useOnlineStatus from './hooks/useOnlineStatus'
import NoInternet from './Component/NoInternet'
import { Toaster } from 'react-hot-toast'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const Root = () => {
  const isOnline = useOnlineStatus();
  if (!isOnline) return <NoInternet />

  return (
    // <StrictMode>
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
    // </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />)
