import React from 'react'

export default function OnlineBadge({ imageUrl, firstName }) {
  return (
    <div className=' rounded-full flex gap-1 border-2 border-green-500 shadow-sm w-fit px-2 py-0.5 items-center'>
      {/* <div className="dot w-1.5 h-1.5 rounded-full bg-green-500 "></div> */}
      <div className="image  relative">
        <img className='w-4 h-4 rounded-full' src={imageUrl} alt="" />
      </div>
      <div className="name capitalize text-[9px] ">
        {firstName}
      </div>
    </div>
  )
}
