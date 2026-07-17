import { MdDeleteOutline } from "react-icons/md";

export default function Reactions({ addReaction, id, prevReaction }) {
  const reactions = ["❤️", "👍", "😂", "😯", "😥", "🤬"]
  return (
    <div className='bg-[var(--bg-surface)] border border-[var(--border-soft)] shadow-[var(--shadow-md)] w-full backdrop-blur-sm rounded-full py-1 flex items-center justify-around px-1 gap-0.5'>
      {reactions.map((reaction, index) => {
        return <button
          key={index}
          onClick={() => addReaction(id, reaction)}
          className='outline-none p-1.5 md:p-1 bg-[var(--bg-input)] rounded-full text-xl md:text-lg cursor-pointer hover:bg-[var(--bg-hover)] hover:scale-125 transition-all duration-150 shadow-[var(--shadow-xs)]'
        >
          {reaction}
        </button>
      })}

      {prevReaction && <button
        onClick={() => addReaction(id, "")}
        className='outline-none p-2 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-full text-base cursor-pointer hover:bg-red-50 hover:text-red-600 transition-all duration-150 shadow-[var(--shadow-xs)]'
      >
        <MdDeleteOutline />
      </button>}

    </div>
  )
}
