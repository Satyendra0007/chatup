import React from 'react'
import { BiMessageSquareEdit } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";

export default function OptionBar({ deleteMessage, id, setShowSeenBy }) {
  return (
    <div className='flex gap-3 justify-end p-3 md:p-2 rounded-full bg-green-900/20 backdrop-blur-xs shadowxl w-full '>
      <button onClick={() => setShowSeenBy(prev => !prev)} className="delete p-2 bg-gray-200 rounded-full shadow-lg text-2xl cursor-pointer hover:bg-gray-300"><FaRegEye /></button>
      <button className="edit p-2 bg-gray-200 rounded-full shadow-lg text-2xl cursor-pointer hover:bg-gray-300 "><BiMessageSquareEdit /></button>
      <button onClick={() => deleteMessage(id)} className="delete p-2 bg-gray-200 rounded-full shadow-lg text-2xl cursor-pointer hover:bg-gray-300"><MdOutlineDeleteOutline /></button>
    </div>
  )
}