import React from 'react'
import { BiMessageSquareEdit } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";

export default function OptionBar({ deleteMessage, id, text, setText, setShowSeenBy, isGroup, setIsEditingMessage }) {
  const handleOnEdit = () => {
    setText(text)
    setIsEditingMessage(true)
  }
  return (
    <div className='flex gap-2 justify-end p-2 md:p-1.5 rounded-2xl bg-[var(--bg-surface)]/95 backdrop-blur-sm border border-[var(--border-soft)] shadow-[var(--shadow-md)] w-full'>
      {isGroup && <button
        onClick={() => setShowSeenBy(prev => !prev)}
        className="p-2 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-full text-lg cursor-pointer hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors duration-150 shadow-[var(--shadow-xs)]"
        title="Seen by"
      >
        <FaRegEye />
      </button>}
      <button
        onClick={handleOnEdit}
        className="p-2 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-full text-lg cursor-pointer hover:bg-[var(--bg-active)] hover:text-[var(--accent-dark)] transition-colors duration-150 shadow-[var(--shadow-xs)]"
        title="Edit message"
      >
        <BiMessageSquareEdit />
      </button>
      <button
        onClick={() => deleteMessage(id)}
        className="p-2 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-full text-lg cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors duration-150 shadow-[var(--shadow-xs)]"
        title="Delete message"
      >
        <MdOutlineDeleteOutline />
      </button>
    </div>
  )
}