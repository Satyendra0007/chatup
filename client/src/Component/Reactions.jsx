import React from 'react'

export default function Reactions({ addReaction, id }) {
  const reactions = ["❤️", "👍", "😂", "😯", "😥", "🤬"]
  return (
    <div className='bg-white/5 w-full backdrop-blur-lg rounded-full shadow-sm py-1 flex justify-around px-1 gap-1'>
      {reactions.map((reaction, index) => {
        return <button
          key={index}
          onClick={() => addReaction(id, reaction)}
          className='outline-none p-1.5 md:p-1 bg-gray-100/80 rounded-full text-2xl md:text-xl cursor-pointer hover:bg-gray-200 transition-all duration-300'
        >
          {reaction}
        </button>
      })}
    </div>
  )
}
