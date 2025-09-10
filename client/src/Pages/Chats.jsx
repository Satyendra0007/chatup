import { FaArrowLeft } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import Chat from "@/Component/Chat";
import { Link, useParams, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useConversationsStore } from "@/Context/ConversationsStore";
import userimage from '../assets/user.png'
import socket from "@/utils/socket";
import { useUser } from "@clerk/clerk-react";
import TypingIndicator from "@/spinners/TypingIndicator";
import toast from "react-hot-toast";
import OnlineBadge from "@/Component/OnlineBadge";
import { GoInfo } from "react-icons/go";
import ChatInformation from "@/Component/ChatInformation";
import { useAxiosClient } from "@/utils/useAxiosClient";
import ChatSkeleton from "@/spinners/ChatSkeleton";
import OptionBar from "@/Component/OptionBar";

export default function Chats() {
  const { convid } = useParams();
  const { user } = useUser();
  const location = useLocation();
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false);
  const [text, setText] = useState("")
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null)
  const { name, imageUrl, email, receiverId, isGroup, members, groupAdmin } = location.state || {};
  const { fetchConversations, onlineUsers, markAsRead } = useConversationsStore()
  const chatRef = useRef(null);
  const lastTypingTimeRef = useRef(null)
  const typingTimeOutRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const isOnline = onlineUsers?.includes(receiverId)
  const TYPING_TIMEOUT = 3000;
  const axiosClient = useAxiosClient();
  let typing = false;
  const onlineGroupUsers = members?.filter(member =>
    (onlineUsers.includes(member.id) && member.id !== user.id)
  )

  const handleOnChange = (e) => {
    setText(e.target.value)
    if (!typing) {
      typing = true;
      socket.emit('typing', { conversationId: convid, senderId: user.id })
    }

    lastTypingTimeRef.current = new Date().getTime()

    if (typingTimeOutRef.current) {
      clearTimeout(typingTimeOutRef.current)
    }

    typingTimeOutRef.current = setTimeout(() => {
      const now = new Date().getTime();
      const diff = now - lastTypingTimeRef.current
      if (diff >= TYPING_TIMEOUT && typing) {
        socket.emit("stop-typing", convid)
        typing = false;
      }
    }, TYPING_TIMEOUT)

  }

  const fetchMessages = async () => {
    setChatLoading(true)
    try {
      const response = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/message/get/${convid}`, {
        withCredentials: true,
      });
      setMessages(response?.data)
      fetchConversations();
    } catch (error) {
      console.log(error)
    }
    setChatLoading(false)
  }

  const sendMessage = async () => {
    setLoading(true)
    const dummyId = new Date().getTime()
    setMessages(prev => [...prev, { text, _id: dummyId, senderId: user?.id, time: dummyId }])
    try {
      const { data } = await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/message/send`, {
        conversationId: convid,
        text
      }, {
        withCredentials: true,
      })
      socket.emit('send-message', data)
      socket.emit("stop-typing", convid);
      typing = false;
      setMessages(prev => prev.map(message => message._id === dummyId ? data?.newMessage : message))
      fetchConversations();
      setText("")
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const addReaction = async (id, reaction) => {
    setMessages(prev => prev.map(message => message._id === id ? { ...message, reaction: reaction } : message))
    setSelectedChat(null)
    try {
      const { data } = await axiosClient.put(`${import.meta.env.VITE_SERVER_URL}api/message/react/${id}`, {
        reaction
      }, { withCredentials: true })
      socket.emit("message-reaction", data.updatedMessage)
    } catch (error) {
      console.log(error)
    }
  }


  const deleteMessage = async (id) => {
    try {
      setMessages(prev => prev.filter(message => message._id !== id))
      setSelectedChat(null)
      const { data } = await axiosClient.delete(`${import.meta.env.VITE_SERVER_URL}api/message/delete/${id}`, { withCredentials: true });
      socket.emit("delete-message", data.message);
      toast.success("message deleted ")
    } catch (error) {
      console.log(error)
      toast.error("message not deleted")
    }
  }

  useEffect(() => {
    fetchMessages();
    socket.emit('seen-message', { conversationId: convid, userId: user?.id })
    if (showChatInfo) {
      setShowChatInfo(false)
    }
  }, [convid])


  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }
    socket.emit('join-room', convid);

  }, [convid]);


  useEffect(() => {
    const handleReceive = (payload) => {
      if (payload?.conversationId === convid) {
        setMessages((prev) => [...prev, payload]);
        socket.emit('seen-message', { conversationId: convid, userId: user?.id })
      }
      else {
        toast.success("New Message Received", { id: 'new-msg' });
      }
      fetchConversations();
    };

    const handleTyping = (payload) => {
      if (payload?.conversationId === convid && payload?.senderId != user?.id) {
        setIsTyping(true)
      }
    }

    const handleStopTyping = (conversationId) => {
      if (conversationId === convid) {
        setIsTyping(false)
      }
    }

    const handleSeen = (payload) => {
      if (payload?.conversationId === convid && payload?.userId !== user?.id) {
        setMessages(prev =>
          prev.map(mess =>
            (mess.senderId === user.id && !mess.seenBy?.includes(payload.userId))
              ? { ...mess, seenBy: [... new Set([...mess.seenBy, payload?.userId])] }
              : mess
          )
        )
      }
    }

    const updateReaction = (payload) => {
      if (payload?.conversationId === convid && payload?.senderId !== user?.id) {
        setMessages(prev => prev.map(message => message._id === payload?._id ? { ...message, reaction: payload.reaction } : message))
      }
    }

    const handleDelete = (payload) => {
      if (payload?.conversationId === convid && payload?.senderId !== user?.id) {
        setMessages(prev => prev.filter(message => message._id !== payload._id))
      }
    }

    socket.on('recieve-message', handleReceive);
    socket.on('typing', handleTyping)
    socket.on('stop-typing', handleStopTyping)
    socket.on('seen-message', handleSeen)
    socket.on('update-reaction', updateReaction)
    socket.on('delete-message', handleDelete)

    return () => {
      socket.off('recieve-message', handleReceive);
      socket.off('typing', handleTyping)
      socket.off('stop-typing', handleStopTyping)
      socket.off('seen-message', handleSeen)
      socket.off('update-reaction', updateReaction)
      socket.off('delete-message', handleDelete)
    };
  }, [convid]);


  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    markAsRead(convid);
  }, [messages, isTyping]);


  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (!e.target.closest(".option-bar") && !e.target.closest(".chat-message")) {
        setSelectedChat(null);
      }
    };

    document.addEventListener("mousedown", handleCloseMenu);
    return () => document.removeEventListener("mousedown", handleCloseMenu);
  }, []);




  return (
    <div className="flex flex-col h-[94vh] md:h-screen relative">
      <div className="header flex py-2 px-3 md:p-1.5 bg-white items-center justify-between  shadow-md">
        <div className=" user flex">
          <Link to="/conversation" >
            <div className="button text-xl h-11 w-11 flex-shrink-0 flex justify-center items-center  bg-gray-200 rounded-full shadow-xl md:hidden">
              <FaArrowLeft />
            </div>
          </Link>
          <div className="info">
            <div className="flex gap-4 px-2  ">
              <div className="image ">
                <img className="w-12 h-12 rounded-full" src={imageUrl || userimage} alt="" />
              </div>
              <div className="info">
                <h3 className="font-semibold capitalize mb-0.5">{name}</h3>

                {isGroup && <div className="flex items-center gap-1 overflow-scroll hide-scrollbar">
                  {(onlineGroupUsers.length <= 0)
                    ? <p className="text-xs md:text-[11px] "> NO Active User </p>
                    : onlineGroupUsers?.map(user => < OnlineBadge key={user.id} {...user} />)
                  }
                </div>}

                {!isGroup && <>

                  <p className={`${isOnline ? 'text-green-600' : 'text-gray-700'} text-[10px] font-semibold`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </>}
              </div>
            </div>
          </div>
        </div>
        <div className="info-button">
          <button
            className="p-2 rounded-full primary-bg text-white cursor-pointer "
            onClick={() => setShowChatInfo(prev => !prev)}
          >
            <GoInfo />
          </button>
        </div>
      </div>

      {showChatInfo && <ChatInformation setShowChatInfo={setShowChatInfo} {...location.state} />}

      {selectedChat?.isUserMessage && <div className="option-bar absolute top-0 right-0 w-full  px-3">
        <OptionBar deleteMessage={deleteMessage} id={selectedChat?.id} />
      </div>}

      <div ref={chatRef} className="chats h-full p-2 overflow-scroll hide-scrollbar pb-4 space-y-1.5">

        {chatLoading
          ? <ChatSkeleton />
          : (messages?.length === 0)
            ? <div className="text-center my-3"> No Messages </div>
            : messages?.map((message) => {
              return <Chat key={message._id} {...message}
                receiverId={receiverId}
                members={members}
                isGroup={isGroup}
                groupAdmin={groupAdmin}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                addReaction={addReaction}
                deleteMessage={deleteMessage} />
            })}
        {isTyping && <TypingIndicator />}
      </div>

      <div className="chatbox sticky bottom-3 z-40 left-0 w-full px-3">
        <div className="flex items-center justify-between gap-3 bg-white  rounded-3xl shadow-xl pl-4 pr-1 py-1 md:py-0.5 border border-green-400 focus-within:ring-1 focus-within:ring-green-500  transition-all duration-300">

          <input
            value={text}
            onChange={handleOnChange}
            type="text"
            placeholder="Type a message..."
            className="flex-grow min-w-0 bg-transparent outline-none text-base placeholder-gray-400 "
          />

          <button
            disabled={text?.length === 0 || loading}
            onClick={sendMessage}
            className="p-3 rounded-full primary-bg active:scale-95 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BsFillSendFill className="text-xl text-white" />
          </button>
        </div>
      </div>

    </div>
  )
}
