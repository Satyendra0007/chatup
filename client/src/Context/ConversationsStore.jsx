import socket from "@/utils/socket";
import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAxiosClient } from "@/utils/useAxiosClient";

export const ConversationsStore = createContext();

export default function ConversationsWrapper({ children }) {
  const [conversations, setCoversations] = useState([])
  const [isConversationLoading, setIsConversationLoading] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const lastCallRef = useRef(0)
  const axiosClient = useAxiosClient();

  const fetchConversations = async () => {
    let now = new Date().getTime();
    if ((now - lastCallRef.current) < 1000) {
      return;
    }
    lastCallRef.current = now
    setIsConversationLoading(true)
    try {
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


  // const fetchConversations = async () => {
  //   console.log("fetching...")
  //   setLoading(true)
  //   try {
  //     const response = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/conversation`, {
  //       withCredentials: true,
  //     });
  //     setCoversations(response?.data?.conversations)
  //   } catch (error) {
  //     console.log(error)
  //   }
  //   setLoading(false)
  // }

  const markAsUnread = async (conversationId, senderId) => {
    try {
      const response = await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/conversation/markunread`, {
        conversationId, senderId
      }, {
        withCredentials: true,
      });
    } catch (error) {
      console.error(error)
    }
  }

  const markAsReadOnServer = async (conversationId) => {
    try {
      const response = await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/conversation/markread`, {
        conversationId
      }, {
        withCredentials: true,
      });
    } catch (error) {
      console.error(error)
    }
  }

  const updateConversation = (payload) => {
    setCoversations(prev =>
      prev.map(conversation =>
        conversation.conversationId === payload.conversation._id
          ? { ...conversation, lastMessage: payload.newMessage, unreadBy: payload.conversation.unreadBy }
          : conversation
      )
    )
  }

  const markConversationAsRead = (conversationId, userId) => {
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

  return (
    <ConversationsStore.Provider value={{ conversations, setCoversations, fetchConversations, isConversationLoading, markAsUnread, markAsReadOnServer, onlineUsers, updateConversation, markConversationAsRead }} >
      {children}
    </ConversationsStore.Provider>
  )
}

export const useConversationsStore = () => useContext(ConversationsStore)
