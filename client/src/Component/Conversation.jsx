import { useNavigate } from "react-router-dom";
import userimage from "../assets/user.png";
import { useUser } from "@clerk/clerk-react";

export default function Conversation({
  name,
  conversationId,
  receiverId,
  imageUrl,
  email,
  lastMessage,
  unreadBy,
  selectedConversation,
  setSelectedConversation,
  isGroup,
  groupAdmin,
  members,
}) {

  const { user } = useUser();
  const navigate = useNavigate();
  const isUnread = unreadBy?.includes(user?.id);
  const isSelected = conversationId === selectedConversation;

  const handleOnClick = (conversationId) => {
    let data;
    if (isGroup) {
      data = { name, isGroup, groupAdmin, members };
    } else {
      data = { receiverId, name, imageUrl, email, isGroup };
    }
    navigate(`/chatlayout/chats`, {
      state: { ...data, convid: conversationId },
    });
    setSelectedConversation(conversationId);
  };

  return (
    <div
      onClick={() => handleOnClick(conversationId)}
      className={`flex items-center justify-between w-full md:w-80 px-3 py-2.5 md:py-2 rounded-lg cursor-pointer transition-all duration-200 border-b-1 border-gray-300 ${isSelected ? "bg-gray-200" : "hover:bg-gray-50"}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            className="w-11 h-11 rounded-full object-cover border border-gray-200"
            src={imageUrl || userimage}
            alt={name}
          />
          {isUnread && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-indigo-500 rounded-full border-2 border-white"></span>
          )}
        </div>
        <div className="flex flex-col">
          <h3
            className={`md:text-sm font-medium capitalize ${isSelected ? "text-gray-900" : "text-gray-800"
              }`}
          >
            {name}
          </h3>
          <p
            className={`text-xs  md:text-[10px] truncate max-w-[180px] ${isUnread
              ? "font-medium text-indigo-600 "
              : "text-gray-500"
              }`}
          >
            {isUnread ? "New Messages" : lastMessage?.text || "No messages yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
