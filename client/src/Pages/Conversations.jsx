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

export default function Conversations() {

  const { user } = useUser();
  const [selectedConversation, setSelectedConversation] = useState("")
  const { loading, conversations, fetchConversations } = useConversationsStore()
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

    setFilteredConversation(filtered)
  }, [selectedCateogary, search, conversations, user?.id])

  useEffect(() => {
    fetchConversations();
  }, [])

  useEffect(() => {
    conversationRef.current = conversations
  }, [conversations])

  useEffect(() => {
    const handleReceive = (payload) => {
      fetchConversations();
      const sender = conversationRef.current.find((conversation) => conversation.conversationId === payload.conversationId)
      if (Notification.permission === "granted") {
        new Notification(`New Message from ${sender.name}`, {
          body: payload.text,
          icon: sender.imageUrl
        });
      }
    };

    if (!socket.connected) {
      socket.connect()
    }
    socket.emit('setup', user.id);
    socket.on('recieve-message', handleReceive);

    return () => {
      socket.off('recieve-message', handleReceive);
      socket.disconnect()
    };
  }, [user.id]);


  return (
    <div className="cantainer flex">
      <div className="  w-full md:w-auto relative top-0">
        <div className='h-screen w-full md:w-80 box-border md:border-r-1 border-gray-400 overflow-scroll hide-scrollbar '>

          <div className="heading sticky top-0 left-0 z-40 bg-white  shadow-xs py-2 ">
            <Navbar />
            <div className="search flex justify-center items-center w-[21rem] md:w-72 mx-auto h-11  border border-green-300 rounded-full my-1 focus-within:ring-1 focus-within:ring-green-500 shadow-sm transition-all ease-out duration-100">
              <div className="p-3 md:p-2 text-green-500 text-2xl">
                <LuUserSearch />
              </div>
              <input
                type="email"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                placeholder='Enter Name or Email'
                className=' md:text-sm outline-none flex-grow min-w-0'
              />

            </div>
            <div className="filter px-4 py-1 flex justify-center gap-2 items-center">
              {cateogaries.map(cateogary => {
                return <button
                  key={cateogary}
                  onClick={() => setSelectedCateogary(cateogary)}
                  className={`px-4 py-1.5 text-xs md:text-[11px] border border-gray-400 rounded-full cursor-pointer hover:bg-gray-200 ${selectedCateogary === cateogary ? "border-2 border-green-600" : ""} `}>{cateogary}
                </button>
              })}
            </div>
          </div>

          <div className="conversations p-1 space-y-1 flex flex-col items-center ">
            {(filteredConversation?.length == 0 && loading) && <ConversationSpinner />}
            {(filteredConversation?.length <= 0 && !loading) ? <div className="text-center my-3"> No Conversation </div>
              :
              filteredConversation?.map((conversation, index) => {
                return <Conversation key={index} {...conversation}
                  selectedConversation={selectedConversation}
                  setSelectedConversation={setSelectedConversation}
                />
              })}
          </div>

          <div className="button absolute right-6 md:bottom-8 bottom-12 z-10 flex flex-col gap-3 bg-transparent justify-center items-center ">
            <Link to="/aichat">
              <div className='p-2  bg-white border border-green-400 rounded-full cursor-pointer'>
                <img className='w-8' src={ai} alt="" />
              </div>
            </Link>
            <Link to="/chatlayout/search">
              <button className='p-3 primary-bg text-white text-3xl rounded-full cursor-pointer'><HiUserAdd /></button>
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

              <div className="absolute top-56 left-1/2 z-20 w-48 bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-1 flex items-center gap-2 -translate-y-8 ">
                <img className='w-8 h-8 rounded-full' src={userimage} alt="User avatar" />
                <p className='text-[11px] text-left text-gray-700'>Select a chat to start messaging! ❤️</p>
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
              <p className="text-gray-500 mt-1 text-sm">Choose a conversation from the left to see the messages.</p>
            </div>
          </div>
        </div>
      }
    </div>
  )
}


