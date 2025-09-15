import { MdDeleteOutline } from "react-icons/md";

export default function Reactions({ addReaction, id, prevReaction }) {
  const reactions = ["❤️", "👍", "😂", "😯", "😥", "🤬"]
  return (
    <div className='bg-white/5 w-full backdrop-blur-lg rounded-full shadow-sm py-1 flex items-center justify-around px-1 gap-0.5'>
      {reactions.map((reaction, index) => {
        return <button
          key={index}
          onClick={() => addReaction(id, reaction)}
          className='outline-none p-1.5 md:p-1 bg-gray-100/80 rounded-full text-2xl md:text-xl cursor-pointer hover:bg-gray-200 transition-all duration-300'
        >
          {reaction}
        </button>
      })}

      {prevReaction && <button
        onClick={() => addReaction(id, "")}
        className='outline-none p-2.5 bg-gray-100/80 text-green-800 rounded-full text-2xl md:text-xl cursor-pointer hover:bg-gray-200 transition-all duration-300'
      >
        <MdDeleteOutline />
      </button>}

    </div>
  )
}
