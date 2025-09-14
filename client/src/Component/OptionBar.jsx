import React from 'react'
import { BiMessageSquareEdit } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";

export default function OptionBar({ deleteMessage, id, setShowSeenBy, isGroup }) {
  return (
    <div className='flex gap-3 justify-end p-3 md:p-2 rounded-full bg-black/5 backdrop-blur-xs shadow-sm w-full '>
      {isGroup && <button onClick={() => setShowSeenBy(prev => !prev)} className="delete p-2 bg-white text-green-800  rounded-full shadow-lg text-xl cursor-pointer hover:bg-gray-200 transition-all duration-300"><FaRegEye /></button>}
      <button className="edit p-2 bg-white text-green-800  rounded-full shadow-lg text-xl cursor-pointer hover:bg-gray-200 transition-all duration-300 "><BiMessageSquareEdit /></button>
      <button onClick={() => deleteMessage(id)} className="delete p-2 bg-white text-green-800  rounded-full shadow-lg text-xl cursor-pointer hover:bg-gray-200 transition-all duration-300"><MdOutlineDeleteOutline /></button>
    </div>
  )
}