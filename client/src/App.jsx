import { Routes, Route } from "react-router-dom"
import LandingPage from "./Pages/LandingPage"
import RedirectAfterSignIn from "./Component/RedirectAfterSignIn";
import Conversations from "./Pages/Conversations";
import SearchUser from "./Pages/SearchUser";
import Chats from "./Pages/Chats"
import ChatLayout from "./Pages/ChatLayout";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  useUser
} from '@clerk/clerk-react'



function App() {

  return (
    <>
      <RedirectAfterSignIn />
      <Routes>
        <Route path="/" element={<SignedOut>  <LandingPage />  </SignedOut>} />
        <Route path="/conversation" element={<SignedIn> <Conversations /> </SignedIn>} />
        <Route path="/chatlayout" element={<SignedIn> <ChatLayout /></SignedIn>}>
          <Route path="search" element={<SearchUser />} />
          <Route path="chats/:convid" element={<Chats />} />
        </Route>
      </Routes >
    </>
  )
}

export default App
