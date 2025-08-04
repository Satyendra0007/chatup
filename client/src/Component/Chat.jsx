
import { useUser } from "@clerk/clerk-react";
import { PiSealCheckFill } from "react-icons/pi";
import { PiSealCheck } from "react-icons/pi";

export default function Chat({ text, time, senderId, seenBy, receiverId }) {
  const { user } = useUser();
  const isUser = (user.id === senderId);
  const isSeen = seenBy.includes(receiverId)


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
          <div className="message primary-bg text-white max-w-60 min-w-24 md:min-w-32 rounded-md rounded-tr-none pt-0.5 md:pt-1 mb-1 ">
            <div className="text text-sm md:text-xs px-2">{text}</div>
            <div className="flex justify-end items-center px-0.5 gap-1">
              <div className="time text-[10px]  md:text-[7px] ">{convertToIST(time)}</div>
              <div className="tick text-xs"> {isSeen ? <PiSealCheckFill /> : <PiSealCheck />}</div>
            </div>
          </div>
        </div>
        :
        <div className='flex' >
          <div className="message bg-gray-300 max-w-60 min-w-24 md:min-w-32 rounded-md rounded-tl-none pt-0.5 mb-1.5 md:pt-1">
            <div className="text text-sm md:text-xs px-2">{text}</div>
            <div className="time text-[10px] px-1.5 text-end md:text-[7px]">{convertToIST(time)}</div>
          </div>
        </div>
      )}


    </>
  )
}
