import socket from "@/utils/socket";
import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAxiosClient } from "@/utils/useAxiosClient";
import { useUser } from "@clerk/clerk-react";

export const ConversationsStore = createContext();

export default function ConversationsWrapper({ children }) {
  const [conversations, setCoversations] = useState([])
  const [isConversationLoading, setIsConversationLoading] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const lastCallRef = useRef(0)
  const axiosClient = useAxiosClient();
  const { user, isSignedIn } = useUser();

  const fetchConversations = async () => {
    let now = new Date().getTime();
    if ((now - lastCallRef.current) < 1000) {
      return;
    }
    lastCallRef.current = now
    setIsConversationLoading(true)
    try {
      console.log("fetching")
      const response = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/conversation`, {
        withCredentials: true,
      });
      setCoversations(response?.data?.conversations)
    } catch (error) {
      console.log(error)
    }
    finally {
      setIsConversationLoading(false)
    }
  }

  const markAsReadOnServer = async (conversationId) => {
    console.log("mark conversatio as read on server")
    try {
      const response = await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/message/markread`, {
        conversationId
      }, {
        withCredentials: true,
      });
    } catch (error) {
      console.error(error)
    }
  }

  const updateLastmessageAndUnreadby = (payload) => {
    console.log("update lastmessage and readby")
    setCoversations(prev =>
      prev.map(conversation =>
        conversation.conversationId === payload.conversationId
          ? { ...conversation, lastMessage: payload.lastMessage, unreadBy: payload.unreadBy }
          : conversation
      )
    )
  }

  const markConversationAsRead = (conversationId, userId) => {
    console.log("markd conversatin as read ")
    setCoversations(prev =>
      prev.map(conversation =>
        conversation.conversationId === conversationId
          ? { ...conversation, unreadBy: conversation.unreadBy.filter(member => member !== userId) }
          : conversation
      )
    )
  }

  useEffect(() => {
    socket.on("online-users", (payload) => {
      setOnlineUsers(payload)
    })

    return () => socket.off('online-users')
  }, [])

  useEffect(() => {
    if (isSignedIn && user) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit('setup', user.id);
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [isSignedIn, user]);

  return (
    <ConversationsStore.Provider value={{ conversations, setCoversations, fetchConversations, isConversationLoading, markAsReadOnServer, onlineUsers, updateLastmessageAndUnreadby, markConversationAsRead }} >
      {children}
    </ConversationsStore.Provider>
  )
}

export const useConversationsStore = () => useContext(ConversationsStore)
