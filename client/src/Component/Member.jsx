import React from 'react'
import { MdDelete } from "react-icons/md";
import { useUser } from "@clerk/clerk-react"

export default function Member({ id, imageUrl, firstName, lastName, email, groupAdmin }) {
  const { user } = useUser();
  return (
    <div className=" flex justify-between items-center px-2  py-1.5 bg-slate-50 w-[21rem]  border border-gray-200 rounded-lg ">
      <div className="info flex gap-4">
        <div className="image ">
          <img className="w-12 md:w-10 h-12 md:h-10 rounded-full" src={imageUrl} alt="" />
        </div>
        <div className="info  flex flex-col justify-center">
          <h3 className="font-semibold md:text-sm capitalize">{id === user.id ? "you" : firstName}</h3>
          <p className="text-xs md:text-[10px]">{email}</p>
        </div>
      </div>
      <div className="button">
        {(user.id === groupAdmin && id !== user.id) && <button
          className='p-1.5 primary-bg text-white text-xl rounded-full cursor-pointer'>
          <MdDelete />
        </button>}
        {(user.id !== groupAdmin && id === groupAdmin) && <>
          <div className="badge px-3 py-1 bg-green-200 text-xs rounded-full  font-semibol">Admin</div>
        </>}
      </div>
    </div>
  )
}
