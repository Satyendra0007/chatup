import socket from "@/utils/socket";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
export const ConversationsStore = createContext();

export default function ConversationsWrapper({ children }) {
  const [conversations, setCoversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}api/conversation`, {
        withCredentials: true,
      });
      setCoversations(response?.data?.conversations)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const markAsUnread = async (conversationId, senderId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}api/conversation/markunread`, {
        conversationId, senderId
      }, {
        withCredentials: true,
      });
    } catch (error) {
      console.error(error)
    }
  }

  const markAsRead = async (conversationId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}api/conversation/markread`, {
        conversationId
      }, {
        withCredentials: true,
      });
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    socket.on("online-users", (payload) => {
      setOnlineUsers(payload)
    })

    return () => socket.off('online-users')
  }, [])

  return (
    <ConversationsStore.Provider value={{ conversations, setCoversations, fetchConversations, loading, markAsUnread, markAsRead, onlineUsers }} >
      {children}
    </ConversationsStore.Provider>
  )
}

export const useConversationsStore = () => useContext(ConversationsStore)
