import { FaArrowLeft } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import Chat from "@/Component/Chat";
import { Link, useLocation } from "react-router-dom";
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
import MessageSeenByUser from "@/Component/MessageSeenByUser";

export default function Chats() {
  const { user } = useUser();
  const location = useLocation();
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [text, setText] = useState("")
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showSeenBy, setShowSeenBy] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const { name, imageUrl, receiverId, isGroup, members, groupAdmin, convid } = location.state || {};
  const { setCoversations, conversations, onlineUsers, markAsReadOnServer, markConversationAsRead, updateLastmessageAndUnreadby } = useConversationsStore()
  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const lastTypingTimeRef = useRef(null)
  const typingTimeOutRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const isOnline = onlineUsers?.includes(receiverId)
  const TYPING_TIMEOUT = 3000;
  const axiosClient = useAxiosClient();
  let typing = false;
  const newLastMessageRef = useRef(null)
  const onlineGroupUsers = members?.filter(member =>
    (onlineUsers.includes(member.id) && member.id !== user.id)
  )

  const [viewportHeight, setViewportHeight] = useState(window.visualViewport ? window.visualViewport.height : window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
      // Keep scroll at bottom when keyboard opens/closes
      if (chatRef.current) {
        chatRef.current.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "instant",
        });
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const updateMessagelistAndLastmessage = (messageId, convid) => {
    const lastMessage = conversations.find(({ conversationId }) => conversationId === convid)?.lastMessage

    if (lastMessage?._id !== messageId) {
      setMessages(prev => prev.filter(message => message._id !== messageId))
      return;
    }

    setMessages(prev => {
      const updatedMessages = prev.filter(message => message._id !== messageId)
      newLastMessageRef.current = updatedMessages.at(-1) || null
      console.log(newLastMessageRef.current)
      return updatedMessages
    })
    console.log(newLastMessageRef.current)
    setCoversations(((prev) => prev.map((conversation) => (conversation.conversationId === convid)
      ? { ...conversation, lastMessage: newMessage }
      : conversation)
    ))
  }

  const handleOnChange = (e) => {
    setText(e.target.value)
    if (!isEditingMessage) {
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
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim().length > 0 && !loading) {
        isEditingMessage ? editMessage() : sendMessage();
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const fetchMessages = async () => {
    setIsChatLoading(true)
    try {
      const response = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/message/get/${convid}`, {
        withCredentials: true,
      });
      setMessages(response?.data)
      socket.emit('seen-message', { conversationId: convid, userId: user?.id })
    } catch (error) {
      console.log(error)
    }
    finally {
      setIsChatLoading(false)
    }
  }

  const sendMessage = async () => {
    if (text.trim().length === 0) return;
    setLoading(true)
    const tempId = crypto.randomUUID();
    const dummyText = text.trim();
    setMessages(prev => [...prev, { text: dummyText, _id: tempId, senderId: user?.id, time: new Date().getTime() }])
    setText("")
    if (textareaRef.current) textareaRef.current.focus();
    try {
      const { data } = await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/message/send`, {
        conversationId: convid,
        text: dummyText,
        tempId
      }, {
        withCredentials: true,
      })
      typing = false;
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

  const addReaction = async (id, reaction) => {
    setMessages(prev => prev.map(message => message._id === id ? { ...message, reaction: reaction } : message))
    setSelectedChat(null)
    try {
      const { data } = await axiosClient.put(`${import.meta.env.VITE_SERVER_URL}api/message/react/${id}`, {
        reaction
      }, { withCredentials: true })
    } catch (error) {
      console.log(error)
    }
  }

  const deleteMessage = async (id) => {
    // setMessages(prev => prev.filter(message => message._id !== id))
    // const lastMessage = conversations.find(({ conversationId }) => conversationId === convid)?.lastMessage
    // if (lastMessage?._id === id) {
    //   const prevMessage = messages.length ? messages[messages.length - 2] : null;
    //   setCoversations(((prev) => prev.map((conversation) => (conversation.conversationId === convid)
    //     ? { ...conversation, lastMessage: prevMessage }
    //     : conversation)
    //   ))
    // }
    updateMessagelistAndLastmessage(id, convid)
    setSelectedChat(null)
    try {
      const { data } = await axiosClient.delete(`${import.meta.env.VITE_SERVER_URL}api/message/delete/${id}`, { withCredentials: true });
      toast.success("message deleted ")
    } catch (error) {
      console.log(error)
      toast.error("message not deleted")
    }
  }

  const editMessage = async () => {
    if (text.trim().length === 0) return;
    const dummyText = text.trim();
    setMessages(prev => prev.map(message => message._id === selectedChat.id ? { ...message, text: dummyText } : message));
    setText("")
    if (textareaRef.current) textareaRef.current.focus();
    try {
      const { data } = await axiosClient.put(`${import.meta.env.VITE_SERVER_URL}api/message/edit/${selectedChat.id}`, {
        editedText: dummyText
      }, {
        withCredentials: true,
      })
      setSelectedChat(null)
      toast.success("message edited ")
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    socket.emit('join-room', convid);
    return () => socket.emit("leave-room", convid)
  }, [convid]);

  useEffect(() => {
    fetchMessages();
    markAsReadOnServer(convid);
    markConversationAsRead(convid, user?.id)
    if (showChatInfo) {
      setShowChatInfo(false)
    }
  }, [convid])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {

  })

  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (!e.target.closest(".option-bar") && !e.target.closest(".chat-message") && !e.target.closest(".chatbox")) {
        setSelectedChat(null);
        setShowSeenBy(false)
      }
    };

    document.addEventListener("mousedown", handleCloseMenu);
    return () => document.removeEventListener("mousedown", handleCloseMenu);
  }, []);

  useEffect(() => {
    const handleReceive = (payload) => {
      console.log("handle receive function socket")
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m._id === payload?.message.tempId)
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = payload.message
          return copy;
        }

        return [...prev, payload.message]
      })
      socket.emit('seen-message', { conversationId: convid, userId: user?.id })
      markConversationAsRead(payload?.message?.conversationId, user?.id)
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
      setMessages(prev =>
        prev.map(mess =>
          (mess.senderId === user.id && !mess.seenBy?.includes(payload.userId))
            ? { ...mess, seenBy: [... new Set([...mess.seenBy, payload?.userId])] }
            : mess
        )
      )
    }

    const updateReaction = (payload) => {
      if (payload?.conversationId === convid) {
        setMessages(prev => prev.map(message => message._id === payload?._id ? { ...message, reaction: payload.reaction } : message))
      }
    }

    const handleDelete = (payload) => {
      if (payload?.conversationId === convid && payload?.senderId !== user?.id) {
        // setMessages(prev => prev.filter(message => message._id !== payload._id))
        // const lastMessage = conversations.find(({ conversationId }) => conversationId === convid)?.lastMessage
        // if (lastMessage?._id === id) {
        //   const prevMessage = messages.length ? messages[messages.length - 2] : null;
        //   setCoversations(((prev) => prev.map((conversation) => (conversation.conversationId === convid)
        //     ? { ...conversation, lastMessage: prevMessage }
        //     : conversation)
        //   ))
        // }
        updateMessagelistAndLastmessage(payload?._id, convid)
      }
    }

    const handleEdit = (payload) => {
      if (payload?.conversationId === convid && payload?.senderId !== user?.id) {
        setMessages(prev => prev.map(message => message._id === payload?._id ? { ...message, text: payload?.text } : message))
      }
    }

    socket.on('new-message', handleReceive);
    socket.on('typing', handleTyping)
    socket.on('stop-typing', handleStopTyping)
    socket.on('seen-message', handleSeen)
    socket.on('update-reaction', updateReaction)
    socket.on('delete-message', handleDelete)
    socket.on('edit-message', handleEdit)

    return () => {
      socket.off('new-message', handleReceive);
      socket.off('typing', handleTyping)
      socket.off('stop-typing', handleStopTyping)
      socket.off('seen-message', handleSeen)
      socket.off('update-reaction', updateReaction)
      socket.off('delete-message', handleDelete)
      socket.off('edit-message', handleEdit)
    };
  }, [convid]);





  return (
    <div 
      className="flex flex-col fixed inset-0 md:static w-full md:h-screen bg-[var(--bg-page)] z-50 md:z-auto overscroll-none overflow-hidden"
      style={{ height: viewportHeight ? `${viewportHeight}px` : '100dvh' }}
    >
      <div className="header shrink-0 flex py-2 px-3 md:p-1.5 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-soft)] items-center justify-between z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="user flex items-center">
          <Link to="/conversation">
            <div className="text-lg h-10 w-10 flex-shrink-0 flex justify-center items-center hover:bg-gray-100 rounded-full text-gray-500 transition-colors md:hidden">
              <FaArrowLeft />
            </div>
          </Link>
          <div className="flex gap-3 px-1.5 items-center">
            {/* Avatar with online ring */}
            <div className="relative flex-shrink-0">
              <img
                className={`w-10 h-10 rounded-full object-cover ${
                  isOnline ? "ring-2 ring-[var(--accent-muted)] ring-offset-1" : "ring-1 ring-black/[0.08]"
                }`}
                src={imageUrl || userimage}
                alt={name}
              />
              {isOnline && (
                <span className="online-ring absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            {/* Name + status */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-sm text-gray-900 capitalize leading-tight">{name}</h3>
              {isGroup ? (
                <div className="flex items-center gap-1 overflow-hidden">
                  {onlineGroupUsers.length === 0 ? (
                    <p className="text-[10px] text-gray-400">No active members</p>
                  ) : (
                    <div className="flex items-center gap-1 overflow-scroll hide-scrollbar">
                      {onlineGroupUsers.map(u => <OnlineBadge key={u.id} {...u} />)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />}
                  <p className={`text-[10px] font-medium ${
                    isOnline ? "text-[var(--accent-dark)]" : "text-[var(--text-muted)]"
                  }`}>
                    {isOnline ? "Active now" : "Offline"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="info-button">
          <button
            className="p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors cursor-pointer"
            onClick={() => setShowChatInfo(prev => !prev)}
          >
            <GoInfo className="text-xl" />
          </button>
        </div>
      </div>

      {/* ---------------Appears when (showChatInfo) ---------------- */}
      <div className={`chatinfo w-full h-full absolute top-0 bottom-0 z-50 ${showChatInfo ? "left-0" : "-left-[100%]"} transition-all duration-500 ease-in-out `}>
        <ChatInformation setShowChatInfo={setShowChatInfo} {...location.state} />
      </div>

      {/* ---------------Appears when (selectedChat?.isUserMessage) ---------------- */}

      {/* OptionBar has been replaced by the contextual FloatingActionMenu in Chat.jsx */}

      {/* ---------------Appears when (isGroup && selectedChat && showSeenBy) ---------------- */}
      <div className={`seebBy absolute z-50 left-0 w-full ${(selectedChat && showSeenBy && isGroup) ? "bottom-0" : "-bottom-[100%]"} transition-all duration-500 ease-in-out `}>
        {isGroup && <MessageSeenByUser seenBy={selectedChat?.seenBy} members={members} />}
      </div>

      <div ref={chatRef} className="chats flex-1 min-h-0 p-2 overflow-y-auto hide-scrollbar pb-4 space-y-3">
        {isChatLoading
          ? <ChatSkeleton />
          : (messages?.length === 0)
            ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] text-2xl">💬</div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">No messages yet</p>
                <p className="text-xs text-[var(--text-muted)]">Send a message to start the conversation</p>
              </div>
            )
            : messages.reduce((acc, message, idx) => {
                // Insert date separator when day changes
                const msgDate = new Date(message.time).toDateString();
                const prevDate = idx > 0 ? new Date(messages[idx - 1].time).toDateString() : null;
                if (msgDate !== prevDate) {
                  const label = (() => {
                    const d = new Date(message.time);
                    const today = new Date().toDateString();
                    const yesterday = new Date(Date.now() - 86400000).toDateString();
                    if (d.toDateString() === today) return "Today";
                    if (d.toDateString() === yesterday) return "Yesterday";
                    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
                  })();
                  acc.push(
                    <div key={`sep-${message._id}`} className="date-sep flex items-center gap-3 py-1">
                      <span className="text-[10px] text-[var(--text-muted)] font-medium bg-[var(--bg-page)] px-2 py-0.5 flex-shrink-0">{label}</span>
                    </div>
                  );
                }
                acc.push(
                  <Chat key={message._id} {...message}
                    receiverId={receiverId}
                    members={members}
                    isGroup={isGroup}
                    groupAdmin={groupAdmin}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    addReaction={addReaction}
                    deleteMessage={deleteMessage}
                    setText={setText}
                    setShowSeenBy={setShowSeenBy}
                    setIsEditingMessage={setIsEditingMessage}
                  />
                );
                return acc;
              }, [])}
        {isTyping && <TypingIndicator />}
      </div>

      <div className="chatbox shrink-0 w-full px-3 pb-3 pt-1 bg-[var(--bg-page)] relative z-40">
        {isEditingMessage && (
          <div className="mb-1 mx-1 px-3 py-1.5 bg-[var(--bg-active)] border border-[var(--border-soft)] rounded-xl flex items-center justify-between shadow-[var(--shadow-xs)]">
            <p className="text-[10px] text-[var(--accent-dark)] font-medium">✏️ Editing message</p>
            <button onClick={() => { setIsEditingMessage(false); setText(""); }} className="text-[10px] text-[var(--accent)] hover:text-[var(--accent-dark)]">
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-end justify-between gap-2 bg-[var(--bg-surface)] rounded-[20px] shadow-[var(--shadow-sm)] pl-4 pr-1 py-1 border border-[var(--border-medium)] focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleOnChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message..."
            className="flex-grow min-w-0 bg-transparent outline-none text-base md:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none py-2.5 hide-scrollbar leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
          <button
            disabled={text.trim().length === 0 || loading}
            onClick={isEditingMessage ? editMessage : sendMessage}
            className="sendbutton shrink-0 p-2.5 rounded-full primary-bg active:scale-90 transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            <BsFillSendFill className="text-lg text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
