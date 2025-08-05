import { FaArrowLeft } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import Chat from "@/Component/Chat";
import { Link, useParams, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useConversationsStore } from "@/Context/ConversationsStore";
import userimage from '../assets/user.png'
import socket from "@/utils/socket";
import { useUser } from "@clerk/clerk-react";
import TypingIndicator from "@/spinners/TypingIndicator";
import toast from "react-hot-toast";

export default function Chats() {
  const { convid } = useParams();
  const { user } = useUser();
  const location = useLocation();
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const { name, imageUrl, email, receiverId } = location.state || {};
  const { fetchConversations, onlineUsers, markAsRead } = useConversationsStore()
  const chatRef = useRef(null);
  const lastTypingTimeRef = useRef(null)
  const typingTimeOutRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const isOnline = onlineUsers?.includes(receiverId)
  const TYPING_TIMEOUT = 3000;
  let typing = false;

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
        console.log('stop typing')
        typing = false;
      }
    }, TYPING_TIMEOUT)

  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}api/message/get/${convid}`, {
        withCredentials: true,
      });
      setMessages(response?.data)
      fetchConversations();
    } catch (error) {
      console.log(error)
    }
  }

  const sendMessage = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_SERVER_URL}api/message/send`, {
        conversationId: convid,
        text
      }, {
        withCredentials: true,
      })
      socket.emit('send-message', data)
      socket.emit("stop-typing", convid);
      typing = false;
      setMessages((prev) => [...prev, data?.newMessage]);
      fetchConversations();
      setText("")
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchMessages();
    socket.emit('seen-message', { conversationId: convid, userId: user?.id })
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

    socket.on('recieve-message', handleReceive);
    socket.on('typing', handleTyping)
    socket.on('stop-typing', handleStopTyping)
    socket.on('seen-message', handleSeen)


    return () => {
      socket.off('recieve-message', handleReceive);
      socket.off('typing', handleTyping)
      socket.off('stop-typing', handleStopTyping)
      socket.off('seen-message', handleSeen)
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



  return (
    <div className="flex flex-col">
      <div className="user flex p-3 md:p-1 bg-gray-100 ">
        <Link to="/conversation" >
          <div className="button text-2xl h-12 w-12 flex-shrink-0 flex justify-center items-center  bg-gray-200 rounded-full shadow-xl md:hidden">
            <FaArrowLeft />
          </div>
        </Link>
        <div className="info">
          <div className="flex gap-4 px-2  ">
            <div className="image ">
              <img className="w-12 h-12 rounded-full" src={imageUrl || userimage} alt="" />
            </div>
            <div className="info">
              <h3 className="font-semibold capitalize">{name}</h3>
              <p className=" text-[11px]">{email}</p>
              <p className={`${isOnline ? 'text-green-600' : 'text-gray-700'} text-[10px] font-semibold`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div ref={chatRef} className="chats h-[82vh] p-2 overflow-scroll hide-scrollbar">
        {messages?.length == 0 && <div className="text-center my-3"> No Messages </div>}
        {messages?.map((message, index) => {
          return <Chat key={index} {...message} receiverId={receiverId} />
        })}
        {isTyping && <TypingIndicator />}
      </div>
      <div className="options flex justify-between px-2 md:gap-4">
        <div className="input md:flex-grow-1 ">
          <input
            value={text}
            onChange={handleOnChange}
            className='border border-gray-400 w-72 md:w-full h-11.5 md:h-10 px-2.5 rounded-lg shadow-lg md:text-sm' type="text" placeholder='Type Message Here ....' />
        </div>
        <div className="button">
          <button disabled={text?.length === 0} onClick={sendMessage} className="p-3 md:p-2.5 cursor-pointer primary-bg text-white text-xl rounded-lg disabled:opacity-90 "><BsFillSendFill /></button>
        </div>
      </div>
    </div>
  )
}
