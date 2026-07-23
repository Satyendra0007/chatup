import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { pageTransition } from "./utils/animations"
import LandingPage from "./Pages/LandingPage"
import RedirectAfterSignIn from "./Component/RedirectAfterSignIn";
import Conversations from "./Pages/Conversations";
import SearchUser from "./Pages/SearchUser";
import Chats from "./Pages/Chats"
import ChatLayout from "./Pages/ChatLayout";
import AiChat from "./Pages/AiChat";
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import OfflineBanner from "./Component/OfflineBanner";
import IncomingCallModal from './Component/Call/IncomingCallModal'
import ActiveCallScreen from './Component/Call/ActiveCallScreen'

function App() {
  const location = useLocation();

  return (
    // This single wrapper fills exactly var(--app-h) — the live visible viewport.
    // overflow:hidden prevents any page-level scroll from ever appearing.
    <div
      style={{ height: 'var(--app-h, 100dvh)' }}
      className="w-full overflow-hidden flex flex-col"
    >
      <IncomingCallModal />
      <ActiveCallScreen />
      <OfflineBanner />
      <RedirectAfterSignIn />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div {...pageTransition} className="h-full w-full">
              <SignedOut><LandingPage /></SignedOut>
            </motion.div>
          } />
          <Route path="/conversation" element={
            <motion.div {...pageTransition} className="h-full w-full">
              <SignedIn><Conversations /></SignedIn>
            </motion.div>
          } />
          <Route path="/aichat" element={
            <motion.div {...pageTransition} className="h-full w-full">
              <SignedIn><AiChat /></SignedIn>
            </motion.div>
          } />
          <Route path="/chatlayout" element={
            <motion.div {...pageTransition} className="h-full w-full flex-1 min-h-0">
              <SignedIn><ChatLayout /></SignedIn>
            </motion.div>
          }>
            <Route path="search" element={<SearchUser />} />
            <Route path="chats" element={<Chats />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
