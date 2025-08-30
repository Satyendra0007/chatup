
import { useUser } from "@clerk/clerk-react";
import { PiSealCheckFill } from "react-icons/pi";
import { PiSealCheck } from "react-icons/pi";
import { IoIosStar } from "react-icons/io";

export default function Chat({ text, time, senderId, seenBy, receiverId, members, isGroup, groupAdmin }) {
  const { user } = useUser();
  const isUser = (user.id === senderId);
  const isSeen = seenBy?.includes(receiverId)
  const senderInfo = members?.find(member => member.id === senderId)


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
    <>
      {(isUser ?
        <div className='flex justify-end'>
          <div className="message primary-bg text-white max-w-60 min-w-24 md:min-w-32 rounded-md rounded-tr-none pt-0.5 md:pt-1 mb-1  shadow-lg ">
            <div className="text pt-0.5 text-xs md:text-[10px] px-2">{text}</div>
            <div className="flex justify-end items-center p-0.5 gap-1">
              <div className="time text-[8px]  md:text-[7px] ">{convertToIST(time)}</div>
              <div className="tick text-xs"> {isSeen ? <PiSealCheckFill /> : <PiSealCheck />}</div>
            </div>
          </div>
        </div>
        :
        <div className='flex gap-1 ' >
          {isGroup && <div className="info">
            <img className="w-7 h-7 rounded-full" src={senderInfo?.imageUrl} alt="" />
          </div>
          }
          <div className="message bg-gray-300 max-w-60 min-w-24 md:min-w-32 rounded-md rounded-tl-none pt-0.5 mb-1.5 md:pt-1 shadow-lg">
            {isGroup && <div className="user text-[9px] md:text-[8px] px-2 flex  items-center gap-0.5">
              {senderInfo?.firstName} {(senderId === groupAdmin) && <IoIosStar className="text-red-600" />}
            </div>
            }
            <div className="text text-xs pt-0.5 md:text-[10px] px-2">{text}</div>
            <div className="time text-[8px] px-1.5 pb-0.5 text-end md:text-[7px]">{convertToIST(time)}</div>
          </div>
        </div>
      )}


    </>
  )
}


