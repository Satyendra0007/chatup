import "../style/markdown.css"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ai from "../assets/ai.gif";
import { FaRegCopy } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { useUser } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { messageAppear } from "@/utils/animations";

export default function AiResponse({ _id, prompt, response, handleCopy, deleteResponse }) {
  const { user } = useUser();

  return (
    <div className="space-y-2.5">
      {/* ── User prompt bubble (right) ── */}
      <motion.div
        {...messageAppear(true)}
        className="flex justify-end items-end gap-2"
      >
        <div
          className="text-white text-xs md:text-[10px] leading-snug max-w-[78%] rounded-2xl rounded-tr-[4px] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
          style={{ backgroundColor: 'var(--bubble-out-bg)' }}
        >
          <p className="whitespace-pre-wrap break-words">{prompt}</p>
        </div>
        <img
          className="w-6 h-6 rounded-full object-cover ring-1 ring-black/[0.06] flex-shrink-0 self-end"
          src={user?.imageUrl}
          alt=""
        />
      </motion.div>

      {/* ── AI response bubble (left) ── */}
      {response && (
        <motion.div
          {...messageAppear(false)}
          className="flex items-end gap-2"
        >
          <img
            className="w-6 h-6 rounded-full object-cover ring-1 ring-black/[0.06] flex-shrink-0 self-end"
            src={ai}
            alt="AI"
          />
          <div
            className="max-w-[80%] rounded-2xl rounded-tl-[4px] px-2.5 py-2 shadow-[var(--shadow-xs)] border border-[var(--border-medium)]"
            style={{ backgroundColor: 'var(--bubble-in-bg)', color: 'var(--bubble-in-text)' }}
          >
            {/* Sender label */}
            <span className="text-[9px] md:text-[8px] font-semibold mb-0.5 block" style={{ color: 'var(--accent)' }}>
              AI Assistant
            </span>

            {/* Markdown content */}
            <div className="markdown max-w-none text-xs md:text-[11px] leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {response}
              </ReactMarkdown>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-1.5 mt-2 pt-1.5 border-t border-[var(--border-soft)]">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopy(response)}
                title="Copy response"
                className="w-7 h-7 rounded-full flex items-center justify-center border border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-sm"
              >
                <FaRegCopy />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deleteResponse(_id)}
                title="Delete"
                className="w-7 h-7 rounded-full flex items-center justify-center border border-[var(--border-medium)] text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer text-base"
              >
                <MdDeleteOutline />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
