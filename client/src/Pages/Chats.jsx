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
import ReplyComposer from "@/Component/ReplyComposer";
import { motion, AnimatePresence } from "motion/react";
import { slideInRight, hoverScale, tapScale } from "@/utils/animations";
import useOnlineStatus from "@/hooks/useOnlineStatus";

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
  const [replyingTo, setReplyingTo] = useState(null)   // { messageId, senderId, text }
  const [highlightedId, setHighlightedId] = useState(null)
  const { name, imageUrl, receiverId, isGroup, members, groupAdmin, convid } = location.state || {};
  const { setCoversations, conversations, onlineUsers, markAsReadOnServer, markConversationAsRead } = useConversationsStore()
  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const messageRefs = useRef({});   // { [messageId]: HTMLElement }
  const lastTypingTimeRef = useRef(null)
  const typingTimeOutRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const isOnline = onlineUsers?.includes(receiverId)
  const TYPING_TIMEOUT = 3000;
  const axiosClient = useAxiosClient();
  const isOnlineContext = useOnlineStatus();
  let typing = false;
  const newLastMessageRef = useRef(null)
  const onlineGroupUsers = members?.filter(member =>
    (onlineUsers.includes(member.id) && member.id !== user.id)
  )

  // Viewport height is managed globally via --app-h CSS custom property (main.jsx)
  // No per-component state needed — the global listener handles keyboard/address bar changes

  const updateMessagelistAndLastmessage = (messageId, convid) => {
    const lastMessage = conversations.find(({ conversationId }) => conversationId === convid)?.lastMessage

    if (lastMessage?._id !== messageId) {
      setMessages(prev => prev.filter(message => message._id !== messageId))
      return;
    }

    setMessages(prev => {
      const updatedMessages = prev.filter(message => message._id !== messageId)
      newLastMessageRef.current = updatedMessages.at(-1) || null
      return updatedMessages
    })
    setCoversations(((prev) => prev.map((conversation) => (conversation.conversationId === convid)
      ? { ...conversation, lastMessage: newLastMessageRef.current }
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

  // ── Scroll helpers ──────────────────────────────────────────────────────
  const scrollToBottom = (behavior = 'smooth') => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior });
    }
  };

  const isNearBottom = () => {
    if (!chatRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    return scrollHeight - scrollTop - clientHeight < 150;
  };

  const fetchMessages = async () => {
    setIsChatLoading(true)
    try {
      const response = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/message/get/${convid}`, {
        withCredentials: true,
      });
      setMessages(response?.data)
      socket.emit('seen-message', { conversationId: convid, userId: user?.id })
      // After data loads and React renders the messages, jump instantly to the bottom
      // Using requestAnimationFrame ensures the DOM has been updated before we measure
      requestAnimationFrame(() => scrollToBottom('instant'));
    } catch (error) {
      console.log(error)
    }
    finally {
      setIsChatLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!isOnlineContext) {
      toast.error("No internet connection. Reconnect to continue.");
      return;
    }
    if (text.trim().length === 0 || loading) return;
    setLoading(true)
    const tempId = crypto.randomUUID();
    const dummyText = text.trim();
    const currentReplyTo = replyingTo ? { ...replyingTo } : null;

    // Optimistic update — show message immediately
    setMessages(prev => [...prev, {
      text: dummyText,
      _id: tempId,
      senderId: user?.id,
      time: new Date().getTime(),
      ...(currentReplyTo ? { replyTo: currentReplyTo } : {})
    }])
    setText("")
    setReplyingTo(null)
    if (textareaRef.current) textareaRef.current.focus();
    // Always scroll to bottom when the user sends a message
    requestAnimationFrame(() => scrollToBottom('smooth'));

    try {
      const payload = { conversationId: convid, text: dummyText, tempId };
      if (currentReplyTo) {
        payload.replyTo = {
          messageId: currentReplyTo.messageId,
          senderId: currentReplyTo.senderId,
          text: currentReplyTo.text
        };
      }
      await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/message/send`, payload, {
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

  const addReaction = async (messageId, reaction) => {
    if (!isOnlineContext) {
      toast.error("No internet connection. Reconnect to continue.");
      return;
    }
    setMessages(prev => prev.map(message => message._id === messageId ? { ...message, reaction: reaction } : message))
    setSelectedChat(null)
    try {
      await axiosClient.put(`${import.meta.env.VITE_SERVER_URL}api/message/react/${messageId}`, {
        reaction
      }, { withCredentials: true })
    } catch (error) {
      console.log(error)
    }
  }

  const deleteMessage = async (messageId) => {
    if (!isOnlineContext) {
      toast.error("No internet connection. Reconnect to continue.");
      return;
    }
    const deleteId = toast.loading("Deleting Message");
    updateMessagelistAndLastmessage(messageId, convid)
    setSelectedChat(null)
    try {
      await axiosClient.delete(`${import.meta.env.VITE_SERVER_URL}api/message/delete/${messageId}`, { withCredentials: true });
      toast.dismiss(deleteId);
      toast.success("message deleted ")
    } catch (error) {
      toast.dismiss(deleteId);
      console.log(error)
      toast.error("message not deleted")
    }
  }

  const editMessage = async () => {
    if (!isOnlineContext) {
        toast.error("No internet connection. Reconnect to continue.");
        return;
    }
    if (text.trim().length === 0) return;
    const dummyText = text.trim();
    setMessages(prev => prev.map(message => message._id === selectedChat.id ? { ...message, text: dummyText } : message));
    setText("")
    setIsEditingMessage(false)
    if (textareaRef.current) textareaRef.current.focus();
    try {
      await axiosClient.put(`${import.meta.env.VITE_SERVER_URL}api/message/edit/${selectedChat.id}`, {
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

  /** Scroll to the original message and briefly highlight it */
  const scrollToMessage = (messageId) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(messageId);
      setTimeout(() => setHighlightedId(null), 1600);
    }
  };

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

  // Removed: catch-all scroll useEffect([messages, isTyping])
  // Scroll is now handled explicitly at three precise moments:
  //   1. fetchMessages → instant jump after load
  //   2. sendMessage  → smooth scroll after optimistic message
  //   3. handleReceive → smooth scroll only when near bottom

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
      // Only auto-scroll for incoming messages when the user is already near the bottom
      // This prevents interrupting a user who is reading old messages
      requestAnimationFrame(() => {
        if (isNearBottom()) scrollToBottom('smooth');
      });
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
      className="flex flex-col h-full w-full bg-[var(--bg-page)] overscroll-none overflow-hidden"
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
      <AnimatePresence>
        {showChatInfo && (
          <motion.div
            {...slideInRight}
            className="chatinfo w-full h-full absolute top-0 left-0 bottom-0 z-50 bg-[var(--bg-surface)] shadow-2xl"
          >
            <ChatInformation setShowChatInfo={setShowChatInfo} {...location.state} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------Appears when (isGroup && selectedChat && showSeenBy) ---------------- */}
      <div className={`seebBy absolute z-50 left-0 w-full ${(selectedChat && showSeenBy && isGroup) ? "bottom-0" : "-bottom-[100%]"} transition-all duration-500 ease-in-out `}>
        {isGroup && <MessageSeenByUser seenBy={selectedChat?.seenBy} members={members} />}
      </div>

      {/* ── Chat messages area ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        ref={chatRef}
        className="chats flex-1 min-h-0 p-2 overflow-y-auto hide-scrollbar pb-4 space-y-3"
      >
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
                    onReply={(info) => {
                      setReplyingTo(info);
                      setSelectedChat(null);
                      textareaRef.current?.focus();
                    }}
                    onScrollToMessage={scrollToMessage}
                    messageRef={{
                      set: (el) => { if (el && message._id) messageRefs.current[message._id] = el; }
                    }}
                    isHighlighted={highlightedId === message._id}
                  />
                );
                return acc;
              }, [])}
        {isTyping && <TypingIndicator />}
      </motion.div>

      {/* ── Compose area ── */}
      <div className="chatbox shrink-0 w-full px-3 pb-3 pt-1 bg-[var(--bg-page)] relative z-40">
        {isEditingMessage && (
          <div className="mb-1 mx-1 px-3 py-1.5 bg-[var(--bg-active)] border border-[var(--border-soft)] rounded-xl flex items-center justify-between shadow-[var(--shadow-xs)]">
            <p className="text-[10px] text-[var(--accent-dark)] font-medium">✏️ Editing message</p>
            <button onClick={() => { setIsEditingMessage(false); setText(""); }} className="text-[10px] text-[var(--accent)] hover:text-[var(--accent-dark)]">
              Cancel
            </button>
          </div>
        )}

        {/* Reply Composer */}
        <AnimatePresence>
          {replyingTo && (
            <ReplyComposer
              replyingTo={replyingTo}
              onCancel={() => setReplyingTo(null)}
              currentUserId={user?.id}
              members={members}
            />
          )}
        </AnimatePresence>

        <div className="flex items-end justify-between gap-2 bg-[var(--bg-surface)] rounded-[20px] shadow-[var(--shadow-sm)] pl-4 pr-1 py-1 border border-[var(--border-medium)] focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all duration-200">
          <textarea
            disabled={!isOnlineContext || loading}
            ref={textareaRef}
            value={text}
            onChange={handleOnChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={isOnlineContext ? "Message..." : "Reconnect to send messages..."}
            className="flex-grow min-w-0 bg-transparent outline-none text-base md:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none py-2.5 hide-scrollbar leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '120px' }}
          />
          <motion.button
            whileHover={(!loading && text.trim().length > 0 && isOnlineContext) ? hoverScale.scale : 1}
            whileTap={(!loading && text.trim().length > 0 && isOnlineContext) ? tapScale.scale : 1}
            disabled={!isOnlineContext || loading || text.trim().length === 0}
            onClick={isEditingMessage ? editMessage : sendMessage}
            className="sendbutton shrink-0 p-2.5 rounded-full primary-bg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BsFillSendFill className="text-white text-base md:text-sm -ml-0.5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
