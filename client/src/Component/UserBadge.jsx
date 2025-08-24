import React from 'react'
import { MdDeleteOutline } from "react-icons/md";

export default function UserBadge({ id, firstName, imageUrl, email, removeUser }) {
  return (
    <div className=' flex gap-1 flex-col items-center border p-3 rounded-lg shadow-md relative shrink-0 '>
      <div onClick={() => removeUser(id)} className="delete absolute top-1 right-1  cursor-pointer text-red-500"><MdDeleteOutline /></div>
      <div className="img">
        <img className='w-16 h-16 rounded-full' src={imageUrl} alt="" />
      </div>
      <div className="info text-center">
        <div className="name text-xs capitalize">{firstName}</div>
        {/* <div className="email text-[10px] font-semibold">{email}</div> */}
      </div>
    </div>
  )
}
