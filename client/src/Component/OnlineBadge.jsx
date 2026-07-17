import React from 'react'

export default function OnlineBadge({ imageUrl, firstName }) {
  return (
    <div className='rounded-full flex gap-1 border border-[var(--accent-muted)] bg-[var(--bg-active)] w-fit px-2 py-0.5 items-center shadow-[var(--shadow-xs)]'>
      <div className="image relative">
        <img className='w-4 h-4 rounded-full object-cover' src={imageUrl} alt="" />
      </div>
      <div className="name capitalize text-[9px] text-[var(--accent-dark)] font-medium">
        {firstName}
      </div>
    </div>
  )
}
