import Conversation from '@/Component/Conversation'
import { HiUserAdd } from "react-icons/hi";
import { Link, useLocation } from 'react-router-dom';
import userimage from "@/assets/user.png"
import Navbar from '@/Component/Navbar';
import girl from "@/assets/girl.png"
import { useEffect, useRef, useState } from 'react';
import { useConversationsStore } from '@/Context/ConversationsStore';
import ConversationSpinner from '@/spinners/ConvSpinner';
import socket from '@/utils/socket';
import { useUser } from '@clerk/clerk-react';
import { LuUserSearch } from "react-icons/lu";
import ai from "../assets/ai.gif"
import { motion, AnimatePresence } from "motion/react";
import { staggerContainer, hoverScale, tapScale } from "@/utils/animations";

export default function Conversations() {

  const { user } = useUser();
  const [selectedConversation, setSelectedConversation] = useState("")
  const { isConversationLoading, conversations, fetchConversations, updateLastmessageAndUnreadby } = useConversationsStore()
  const location = useLocation();
  const isChatLayout = location.pathname?.startsWith("/chatlayout/")
  const [search, setSearch] = useState("")
  const cateogaries = ["All", "People", "Group", "Unread"]
  const [selectedCateogary, setSelectedCateogary] = useState('All');
  const [filteredConversation, setFilteredConversation] = useState([])
  const conversationRef = useRef(conversations)

  useEffect(() => {
    let filtered = conversations.filter(conversation => {
      return conversation?.name?.toLowerCase().includes(search.toLowerCase()) || conversation?.email?.includes(search.toLowerCase())
    })

    switch (selectedCateogary) {
      case "People":
        filtered = filtered.filter(conversation => !conversation?.isGroup)
        break;
      case "Group":
        filtered = filtered.filter(conversation => conversation?.isGroup)
        break;
      case "Unread":
        filtered = filtered.filter(conversation => conversation?.unreadBy?.includes(user.id))
        break;
    }

    filtered.sort((c1, c2) => c2?.lastMessage?.time - c1?.lastMessage?.time)
    setFilteredConversation(filtered)
  }, [selectedCateogary, search, conversations, user?.id])

  useEffect(() => {
    fetchConversations();
  }, [])

  useEffect(() => {
    conversationRef.current = conversations
  }, [conversations])

  useEffect(() => {
    const handleUpdateConversation = (payload) => {
      console.log("runnig update-conversation socket")
      updateLastmessageAndUnreadby(payload);
      const sender = conversationRef.current.find((conversation) => conversation.conversationId === payload?.conversationId)
      if (payload.lastMessage.senderId !== user.id) {
        const isViewingCurrentChat = document.hasFocus() && location.pathname.includes('/chats') && location.state?.convid === payload.conversationId;

        if (!isViewingCurrentChat && Notification.permission === "granted") {
          const notification = new Notification(`New Message from ${sender?.name || "ChatUp"}`, {
            body: payload.lastMessage.text,
            icon: sender?.imageUrl || null
          });

          notification.onclick = () => {
            window.focus();
          };
        }
      }
    };

    socket.on('update-conversation', handleUpdateConversation);

    return () => {
      socket.off('update-conversation', handleUpdateConversation);
    };
  }, [user?.id]);


  return (
    <div className="cantainer flex h-full">
      <div className="w-full md:w-auto relative top-0 h-full flex flex-col">
        <div className='h-full w-full md:w-80 box-border md:border-r border-[var(--border-medium)] bg-[var(--bg-surface)] overflow-y-auto hide-scrollbar flex flex-col'>

          <div className="heading sticky top-0 left-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-soft)] py-2">
            <Navbar />
            <div className="search flex justify-center items-center w-[21rem] md:w-72 mx-auto h-11 bg-[var(--bg-input)] border border-[var(--border-soft)] rounded-[20px] my-1 focus-within:bg-[var(--bg-surface)] focus-within:ring-1 focus-within:ring-[var(--accent)] focus-within:border-[var(--accent)] transition-all ease-out duration-200 shadow-[var(--shadow-xs)]">
              <div className="p-3 md:p-2 text-[var(--text-muted)] text-2xl">
                <LuUserSearch />
              </div>
              <input
                type="email"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                placeholder='Search conversations...'
                className='md:text-sm outline-none flex-grow min-w-0 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)]'
              />

            </div>
            <div className="filter px-4 py-1 flex justify-center gap-2 items-center">
              {cateogaries.map(cateogary => {
                return <button
                  key={cateogary}
                  onClick={() => setSelectedCateogary(cateogary)}
                  className={`px-4 py-1.5 text-xs md:text-[11px] rounded-full cursor-pointer transition-colors ${selectedCateogary === cateogary ? "bg-[var(--bg-active)] text-[var(--accent-dark)] border border-[var(--accent-muted)] font-medium" : "border border-[var(--border-medium)] text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"} `}>{cateogary}
                </button>
              })}
            </div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="conversations p-1 space-y-1 flex flex-col items-center "
          >
            {(filteredConversation?.length == 0 && isConversationLoading) && <ConversationSpinner />}
            {(filteredConversation?.length <= 0 && !isConversationLoading)
              ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] text-xl">💬</div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">No conversations</p>
                  <p className="text-xs text-[var(--text-muted)]">Start one with the + button</p>
                </div>
              )
              : <AnimatePresence mode="popLayout">
                {filteredConversation?.map((conversation, index) => {
                  return <Conversation key={conversation.conversationId || index} {...conversation}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                  />
                })}
              </AnimatePresence>
            }
          </motion.div>

          <div className="button absolute right-4 md:bottom-6 bottom-10 z-10 flex flex-col gap-3 bg-transparent justify-center items-center">
            <Link to="/aichat">
              <motion.div
                whileHover={hoverScale.scale}
                whileTap={tapScale.scale}
                className='p-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] outline-none border border-[var(--border-soft)] rounded-full cursor-pointer transition-all shadow-[var(--shadow-md)] flex items-center justify-center'
              >
                <img className='w-7 dark:invert dark:mix-blend-screen mix-blend-multiply' src={ai} alt="AI Chat" />
              </motion.div>
            </Link>
            <Link to="/chatlayout/search">
              <motion.button
                whileHover={hoverScale.scale}
                whileTap={tapScale.scale}
                className='p-3.5 primary-bg text-white text-2xl rounded-[1.25rem] cursor-pointer shadow-[var(--shadow-fab)] transition-all'
              >
                <HiUserAdd />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {!isChatLayout &&
        <div className="display hidden md:block flex-grow-1  mt-10">
          <div className="flex h-full flex-col items-center justify-center text-center p-4">
            <div className="relative w-80 h-80  mb-6">
              <div className="absolute inset-0 primary-bg rounded-full opacity-30 blur-2xl"></div>
              <div className="absolute inset-0 primary-bg rounded-full opacity-50"></div>

              <div className="absolute top-56 left-1/2 z-20 w-48 bg-[var(--bg-surface)]/95 backdrop-blur-sm shadow-[var(--shadow-md)] border border-[var(--border-soft)] rounded-xl p-1 flex items-center gap-2 -translate-y-8 ">
                <img className='w-8 h-8 rounded-full' src={userimage} alt="User avatar" />
                <p className='text-[11px] text-left text-[var(--text-secondary)] font-medium'>Select a chat to start messaging! ❤️</p>
              </div>
              <img
                className='absolute bottom-0 left-1/2 -translate-x-1/2 h-[95%] object-contain'
                src={girl}
                alt="Illustration of a person chatting"
              />
            </div>

            <div className="text-center">
              <h2 className='font-bold text-xl primary-bg text-transparent bg-clip-text'>
                Your Personal Messaging Space
              </h2>
              <p className="text-[var(--text-secondary)] mt-1.5 text-sm">Choose a conversation from the left to see the messages.</p>
            </div>
          </div>
        </div>
      }
    </div>
  )
}


