import React from 'react'
import { MdDeleteOutline } from "react-icons/md";
import { motion } from "motion/react";
import { popIn } from "@/utils/animations";

export default function UserBadge({ id, firstName, imageUrl, email, removeUser }) {
  return (
    <motion.div 
      layout
      {...popIn}
      className='flex flex-col items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-medium)] p-2.5 rounded-xl shadow-[var(--shadow-sm)] relative shrink-0'
    >
      <button
        onClick={() => removeUser(id)}
        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
        title="Remove"
      >
        <span className="text-[9px] leading-none">✕</span>
      </button>
      <img className='w-10 h-10 rounded-full object-cover' src={imageUrl} alt="" />
      <div className="name text-[10px] text-[var(--text-secondary)] font-medium capitalize text-center">{firstName}</div>
    </motion.div>
  )
}
