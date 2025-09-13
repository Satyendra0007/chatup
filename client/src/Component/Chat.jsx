import { useUser } from "@clerk/clerk-react";
import { PiSealCheckFill } from "react-icons/pi";
import { PiSealCheck } from "react-icons/pi";
import { IoIosStar } from "react-icons/io";
import { useLongPress } from "use-long-press";
import { useEffect, useRef, useState } from "react";
import Reactions from "./Reactions";

export default function Chat({ _id, text, time, senderId, seenBy, receiverId, reaction, members, isGroup, groupAdmin, selectedChat, setSelectedChat, addReaction }) {
  const { user } = useUser();
  const isUser = (user.id === senderId);
  const isSeen = seenBy?.includes(receiverId) || seenBy?.length === (members?.length - 1)
  const senderInfo = members?.find(member => member.id === senderId)
  const isThisChatSelected = selectedChat?.id === _id
  const reactionMenu = useRef(null)

  const handleLongPress = useLongPress(() => {
    const isUserMessage = senderId === user.id;
    setSelectedChat({ id: _id, isUserMessage, seenBy })
  })

  const convertToIST = (milliseconds) => {
    const date = new Date(milliseconds);
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  return (
    <div className="relative chat-message">
      {(isUser ?
        <div className={` flex justify-end select-none ${isThisChatSelected ? "bg-green-200" : ""}`} {...handleLongPress()}>
          <div className="message primary-bg text-white max-w-60 min-w-24 md:min-w-32 rounded-md rounded-tr-none pt-1 md:pt-1  shadow-lg ">
            <div className="text text-xs md:text-[10px] px-2">{text}</div>
            <div className={`flex p-0.5 ${reaction ? "justify-between" : "justify-end"}`}>
              {reaction && <div className="reaction p-[1px] bg-white rounded-full text-xs "> {reaction} </div>}
              <div className="info flex gap-1  items-end">
                <div className="time text-[8px] md:text-[7px] ">{convertToIST(time) || ""}</div>
                <div className="tick text-xs"> {isSeen ? <PiSealCheckFill /> : <PiSealCheck />}</div>
              </div>
            </div>
          </div>
        </div>
        :
        <div className={`flex gap-1 select-none ${isThisChatSelected ? "bg-green-200" : ""}`} {...handleLongPress()} >
          {isGroup && <div className="info">
            <img className="w-7 h-7 rounded-full" src={senderInfo?.imageUrl} alt="" />
          </div>
          }
          <div className="message bg-gray-300 max-w-60 min-w-24 md:min-w-32 rounded-md rounded-tl-none pt-0.5  md:pt-1 shadow-lg">
            {isGroup && <div className="user text-[9px] md:text-[8px] px-2 flex  items-center gap-0.5">
              {senderInfo?.firstName}
              {(senderId === groupAdmin) && <IoIosStar className="text-red-600" />}
            </div>
            }
            <div className="text text-xs pt-0.5 md:text-[10px] px-2">{text}</div>
            <div className={`info flex px-1.5 py-0.5 ${reaction ? "justify-between" : "justify-end"}`}>
              {reaction && <div className="reaction p-[1px] bg-white rounded-full text-xs "> {reaction} </div>}
              <div className="time text-[8px] text-end md:text-[7px]">{convertToIST(time)}</div>
            </div>
          </div>
        </div>
      )}

      {(isThisChatSelected) && <div ref={reactionMenu} className="reaction absolute -top-15 md:-top-12 left-auto z-50 w-80 md:w-72">
        <Reactions addReaction={addReaction} id={_id} />
      </div>}
    </div>
  )
}


