import React, { useLayoutEffect, useRef, useState } from 'react';
import { BiMessageSquareEdit } from "react-icons/bi";
import { MdOutlineDeleteOutline, MdContentCopy } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import { MdOutlineAddReaction } from "react-icons/md";
import { IoArrowUndoOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { hoverScale, tapScale } from "@/utils/animations";

export default function FloatingActionMenu({ 
  deleteMessage, 
  id, 
  text, 
  setText, 
  setShowSeenBy, 
  isGroup, 
  setIsEditingMessage,
  isUserMessage,
  containerRef,
  onOpenReactions,
  onReply
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 'auto', bottom: 'auto', left: 'auto', right: 'auto', transform: 'scale(0.95)', opacity: 0 });

  const handleOnEdit = () => {
    setText(text);
    setIsEditingMessage(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copied!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  useLayoutEffect(() => {
    if (!menuRef.current || !containerRef?.current) return;

    // Simple bounds checking to ensure it doesn't overflow
    const menuRect = menuRef.current.getBoundingClientRect();
    const bubbleRect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    let newPos = { opacity: 1, transform: 'scale(1)' };

    // Determine vertical position: Default to appearing slightly above the bubble
    if (bubbleRect.top - menuRect.height - 8 > 60) { // 60 is approx header height
      newPos.bottom = '100%';
      newPos.marginBottom = '8px';
    } else {
      // Not enough space above, put it below
      newPos.top = '100%';
      newPos.marginTop = '8px';
    }

    // Determine horizontal position based on message ownership
    if (isUserMessage) {
      newPos.right = '0';
    } else {
      newPos.left = '0';
    }

    setPosition(newPos);
  }, [containerRef, isUserMessage]);

  const ActionButton = ({ onClick, icon, label, colorClass, hoverClass }) => (
    <motion.button
      whileHover={hoverScale.scale}
      whileTap={tapScale.scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      className={`w-9 h-9 rounded-full flex flex-shrink-0 items-center justify-center bg-white dark:bg-black/20 border shadow-[var(--shadow-xs)] transition-colors cursor-pointer ${colorClass} ${hoverClass}`}
    >
      {icon}
    </motion.button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      ref={menuRef}
      style={{
        ...position,
        transformOrigin: isUserMessage ? (position.bottom ? 'bottom right' : 'top right') : (position.bottom ? 'bottom left' : 'top left')
      }}
      className={`absolute z-[60] flex flex-row gap-2 p-1.5 bg-white/95 dark:bg-black/80 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[var(--border-soft)]`}
    >
      {/* Reply Action (Available for all) */}
      <ActionButton 
        onClick={onReply || (() => {})} 
        icon={<IoArrowUndoOutline className="text-lg" />} 
        label="Reply" 
        colorClass="border-green-200 text-green-500"
        hoverClass="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
      />

      {/* Copy Action (Available for all) */}
      <ActionButton 
        onClick={handleCopy} 
        icon={<MdContentCopy className="text-lg" />} 
        label="Copy" 
        colorClass="border-slate-200 text-slate-500"
        hoverClass="hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300"
      />

      {/* React Action (Available for all) */}
      <ActionButton 
        onClick={onOpenReactions} 
        icon={<MdOutlineAddReaction className="text-lg" />} 
        label="React" 
        colorClass="border-amber-200 text-amber-500"
        hoverClass="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300"
      />

      {/* Edit/Delete/Seen By (Available for sender only) */}
      {isUserMessage && (
        <>
          <ActionButton 
            onClick={handleOnEdit} 
            icon={<BiMessageSquareEdit className="text-lg" />} 
            label="Edit" 
            colorClass="border-blue-200 text-blue-500"
            hoverClass="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          />
          <ActionButton 
            onClick={() => deleteMessage(id)} 
            icon={<MdOutlineDeleteOutline className="text-lg" />} 
            label="Delete" 
            colorClass="border-red-200 text-red-500"
            hoverClass="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          />
          {isGroup && (
            <ActionButton 
              onClick={() => setShowSeenBy(prev => !prev)} 
              icon={<FaRegEye className="text-lg" />} 
              label="Seen By" 
              colorClass="border-emerald-200 text-emerald-500"
              hoverClass="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
            />
          )}
        </>
      )}
    </motion.div>
  );
}
