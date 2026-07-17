import React from 'react'
import { MdDelete } from "react-icons/md";
import { useUser } from "@clerk/clerk-react"

export default function Member({ id, imageUrl, firstName, lastName, email, groupAdmin }) {
  const { user } = useUser();
  return (
    <div className="flex justify-between items-center px-3 py-2 bg-[var(--bg-surface)] w-[21rem] border border-[var(--border-medium)] rounded-xl shadow-[var(--shadow-sm)] hover:bg-[var(--bg-hover)] transition-colors">
      <div className="info flex gap-3 items-center">
        <div className="image">
          <img className="w-10 h-10 rounded-full object-cover" src={imageUrl} alt="" />
        </div>
        <div className="info flex flex-col justify-center">
          <h3 className="font-medium text-sm text-[var(--text-primary)] capitalize">{id === user.id ? "You" : firstName}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{email}</p>
        </div>
      </div>
      <div className="button">
        {(user.id === groupAdmin && id !== user.id) && <button
          className='p-1.5 primary-bg text-white text-lg rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-xs)]'>
          <MdDelete />
        </button>}
        {(user.id !== groupAdmin && id === groupAdmin) && (
          <div className="badge px-2.5 py-0.5 bg-[var(--bg-active)] text-[var(--accent-dark)] border border-[var(--accent-muted)] text-xs rounded-full font-medium shadow-[var(--shadow-xs)]">Admin</div>
        )}
      </div>
    </div>
  )
}
