import { MdDeleteOutline } from "react-icons/md";
import { motion } from "motion/react";
import { hoverScale, tapScale } from "@/utils/animations";

export default function Reactions({ addReaction, id, prevReaction }) {
  const reactions = ["❤️", "👍", "😂", "😯", "😥", "🤬"]
  return (
    <div className='bg-[var(--bg-surface)] border border-[var(--border-soft)] shadow-[var(--shadow-md)] w-full backdrop-blur-sm rounded-full py-1 flex items-center justify-around px-1 gap-0.5'>
      {reactions.map((reaction, index) => {
        return <motion.button
          key={index}
          whileHover={hoverScale.scale}
          whileTap={tapScale.scale}
          onClick={() => addReaction(id, reaction)}
          className='outline-none p-1.5 md:p-1 bg-[var(--bg-input)] rounded-full text-xl md:text-lg cursor-pointer transition-colors duration-150 shadow-[var(--shadow-xs)] hover:bg-[var(--bg-hover)]'
        >
          {reaction}
        </motion.button>
      })}

      {prevReaction && <motion.button
        whileHover={hoverScale.scale}
        whileTap={tapScale.scale}
        onClick={() => addReaction(id, "")}
        className='outline-none p-2 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-full text-base cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors duration-150 shadow-[var(--shadow-xs)]'
      >
        <MdDeleteOutline />
      </motion.button>}

    </div>
  )
}
