import React from 'react'
import { BiMessageSquareEdit } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";

export default function OptionBar({ deleteMessage, id }) {
  const handleOnClick = (e) => {
    console.log("option bar " + id)
    deleteMessage(id)
  }

  return (
    <div className='flex gap-3 justify-end p-3 md:p-2 rounded-full bg-green-900/20 backdrop-blur-xs shadowxl w-full '>
      <button className="edit p-2 bg-gray-200 rounded-full shadow-lg text-2xl cursor-pointer hover:bg-gray-300 "><BiMessageSquareEdit /></button>
      <button onClick={() => handleOnClick()} className="delete p-2 bg-gray-200 rounded-full shadow-lg text-2xl cursor-pointer hover:bg-gray-300"><MdOutlineDeleteOutline /></button>
    </div>
  )
}