import Conversation from '@/Component/Conversation'
import { HiUserAdd } from "react-icons/hi";
import { Link, useLocation } from 'react-router-dom';
import userimage from "@/assets/user.png"
import Navbar from '@/Component/Navbar';
import girl from "@/assets/girl.png"
import { useEffect, useState } from 'react';
import { useConversationsStore } from '@/Context/ConversationsStore';
import ConversationSpinner from '@/spinners/ConvSpinner';
import socket from '@/utils/socket';
import { useUser } from '@clerk/clerk-react';

export default function Conversations() {

  const [selectedConversation, setSelectedConversation] = useState("")
  const { loading, conversations, fetchConversations } = useConversationsStore()
  const location = useLocation();
  const isChatLayout = location.pathname?.startsWith("/chatlayout/")
  const { user } = useUser();

  useEffect(() => {
    fetchConversations();
  }, [])

  useEffect(() => {
    const handleReceive = (payload) => {
      fetchConversations();
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
  }, []);


  return (
    <div className="cantainer flex">
      <div className="  w-full md:w-auto relative top-0">
        <div className='h-screen w-full md:w-80 box-border md:border-r-2 overflow-scroll hide-scrollbar '>
          <div className="heading sticky top-0 left-0 z-40 bg-white  shadow-xs py-1">
            <Navbar />
            <h1 className='px-3 text-2xl font-semibold mb-4 md:mb-0 md:py-4'>Conversations </h1>
          </div>

          <div className="conversations p-1 space-y-1 flex flex-col items-center ">
            {(conversations?.length == 0 && loading) && <ConversationSpinner />}
            {(conversations?.length <= 0 && !loading) ? <div className="text-center my-3"> No Conversation </div>
              :
              conversations?.map((conversation, index) => {
                return <Conversation key={index} {...conversation}
                  selectedConversation={selectedConversation}
                  setSelectedConversation={setSelectedConversation}
                />
              })}
          </div>

          <div className="button absolute right-6 bottom-6 z-10 shadow-2xl">
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


