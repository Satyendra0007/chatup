import { useNavigate } from "react-router-dom"
import userimage from '../assets/user.png'
import { useUser } from "@clerk/clerk-react";

export default function Conversation({ name, conversationId, receiverId, imageUrl, email, lastMessage, unreadBy, selectedConversation, setSelectedConversation, isGroup, groupAdmin, members }) {

  const { user } = useUser();
  const navigate = useNavigate();
  const isUnread = unreadBy?.includes(user.id)
  const isSelected = conversationId === selectedConversation;

  const handleOnClick = (conversationId) => {
    let data;
    if (isGroup) {
      data = { name, isGroup, groupAdmin, members }
    }
    else {
      data = { receiverId, name, imageUrl, email, isGroup }
    }
    navigate(`/chatlayout/chats/${conversationId}`, {
      state: data
    })
    setSelectedConversation(conversationId)
  }


  return (
    <div
      className={`flex justify-between items-center px-2 py-2 md:py-1 shadow-sm w-full md:w-80  cursor-pointer ${isSelected ? "bg-slate-300" : "hover:bg-slate-100"}`}
      onClick={() => handleOnClick(conversationId)}
    >
      <div className="left flex gap-4 items-center">
        <div className="image ">
          <img className="w-12 h-12 rounded-full" src={imageUrl || userimage} alt="" />
        </div>
        <div className="info">
          <h3 className="font-semibold md:text-sm capitalize">{name}</h3>
          <p className={`text-xs md:text-[10px] ${isUnread ? "font-bold" : ""}`}>{isUnread ? "New Messages" : lastMessage?.text}</p>
        </div>
      </div>
      <div className="right ">
        {isUnread && <div className="cirlcle primary-bg h-2 w-2 rounded-full mr-4">
        </div>}
      </div>

    </div>
  )
}
