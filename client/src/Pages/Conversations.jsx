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
    <div className="box flex ">
      <div className='md:min-h-screen w-full md:w-80 box-border md:relative md:border-r-2'>
        <Navbar />
        <div className="heading">
          <h1 className='px-3 text-2xl font-semibold mb-4 md:mb-0 md:py-4'>Conversations </h1>
        </div>
        <div className="conversations space-y-1 flex flex-col items-center justify-center overflow-scroll hide-scrollbar">
          {(conversations?.length == 0 && loading) && <ConversationSpinner />}
          {(conversations?.length == 0 && !loading) ? <div className="text-center my-3"> No Conversation </div>
            :
            conversations.map((conversation, index) => {
              return <Conversation key={index} {...conversation}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
              />
            })}
        </div>
        <div className="button absolute right-3 bottom-3 z-10">
          <Link to="/chatlayout/search">
            <button className='p-3 primary-bg text-white text-3xl rounded-full cursor-pointer'><HiUserAdd /></button>
          </Link>
        </div>
      </div>
      {!isChatLayout &&
        <div className="display hidden md:block flex-grow-1 mt-10">
          <div className=" relative h-[76vh] ">
            <div className="background h-full flex justify-center items-center relative mx-auto">
              <div className="circle primary-bg rounded-full h-96 w-96 lg:w-[26rem] lg:h-[26rem"></div>
            </div>
            <div className="image absolute z-10 top-0 h-full w-full ">
              <img className=' h-full mx-auto ' src={girl} alt="" />
            </div>
            <div className="message w-48 bg-white flex justify-center items-center backdrop-blur-lg absolute top-56  left-1/2 md:top-80 z-20 text-[10px] gap-2 rounded-md p-1">
              <img className='w-7 h-7 rounded-full ' src={userimage} alt="" />
              <p className=''>Lorem ipsum dolor sit amet jsklf kljf ksl ❤️ .</p>
            </div>
          </div>
          <div className="text text-center my-5">
            <p className='font-semibol text-xl primary-bg text-transparent bg-clip-text'>Choose a Conversation to See Messages </p>
          </div>
        </div>
      }
    </div>
  )
}
