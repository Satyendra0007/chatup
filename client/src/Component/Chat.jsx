import { useUser } from "@clerk/clerk-react";
import { PiSealCheckFill, PiSealCheck } from "react-icons/pi";
import { IoIosStar } from "react-icons/io";
import { useLongPress } from "use-long-press";
import { useRef } from "react";
import Reactions from "./Reactions";

export default function Chat({ _id, text, time, senderId, seenBy, receiverId, reaction, members, isGroup, groupAdmin, selectedChat, setSelectedChat, addReaction }) {
  const { user } = useUser();
  const isUser = (user.id === senderId);
  const isSeen = seenBy?.includes(receiverId) || seenBy?.length === (members?.length - 1)
  const senderInfo = members?.find(member => member.id === senderId)
  const isThisChatSelected = selectedChat?.id === _id
  const reactionMenu = useRef(null)

  const handleLongPress = useLongPress(() => {
    const isUserMessage = senderId === user.id;
    setSelectedChat({ id: _id, isUserMessage, seenBy, text })
  })

  const convertToIST = (ms) => {
    if (!ms) return "";
    return new Date(ms).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  const commonEmojiProps = (reactionValue) => ({
    onClick: (e) => { e.stopPropagation(); addReaction(_id, reactionValue); },
    className: "text-sm hover:scale-125 transition-transform duration-100 cursor-pointer select-none leading-none"
  });

  return (
    <div className={`relative chat-message message-appear ${reaction ? "mb-2.5" : ""}`}>
      {isUser ? (
        /* ── Sender bubble (right) ── */
        <div
          className={`chat-bubble-group flex justify-end select-none px-2 items-end gap-1 ${isThisChatSelected ? "bg-black/[0.04] rounded-xl" : ""}`}
          {...handleLongPress()}
        >
          {/* Hover quick reactions */}
          <div className="hover-reveal flex items-center gap-0.5 self-end mb-0.5">
            {["👍", "❤️", "😂"].map(r => (
              <button key={r} {...commonEmojiProps(r)} title={r}>{r}</button>
            ))}
          </div>

          <div className="flex flex-col items-end">
            {/* Sender bubble — deep teal, slight shadow for depth */}
            <div
              className="message text-white max-w-60 min-w-[4.5rem] rounded-2xl rounded-tr-[4px] px-2.5 pt-1 pb-1 shadow-[0_1px_3px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.06)]"
              style={{ backgroundColor: 'var(--bubble-out-bg)' }}
            >
              <div className="text-xs md:text-[10px] leading-snug whitespace-pre-wrap break-words">{text}</div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-[8px] md:text-[7px] text-white/55 tabular-nums leading-none">{convertToIST(time)}</span>
                <span className="text-[10px] text-white/65 leading-none">{isSeen ? <PiSealCheckFill /> : <PiSealCheck />}</span>
              </div>
            </div>

            {/* Reaction chip */}
            {reaction && (
              <div className="flex items-center bg-white border border-black/[0.08] rounded-full px-1.5 py-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] -mt-2 mr-1 z-10 self-end">
                <span className="text-sm leading-none">{reaction}</span>
              </div>
            )}
          </div>
        </div>

      ) : (
        /* ── Receiver bubble (left) ── */
        <div
          className={`chat-bubble-group flex gap-1.5 select-none px-2 items-end ${isThisChatSelected ? "bg-black/[0.04] rounded-xl" : ""}`}
          {...handleLongPress()}
        >
          {isGroup && (
            <div className="flex-shrink-0 self-start mt-0.5">
              <img className="w-6 h-6 rounded-full object-cover ring-1 ring-black/[0.06]" src={senderInfo?.imageUrl} alt="" />
            </div>
          )}

          <div className="flex flex-col items-start">
            {/* Receiver bubble — off-white surface with soft border */}
            <div
              className="message max-w-60 min-w-[4.5rem] rounded-2xl rounded-tl-[4px] px-2.5 pt-1 pb-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-black/[0.07]"
              style={{ backgroundColor: 'var(--bubble-in-bg)', color: 'var(--bubble-in-text)' }}
            >
              {isGroup && (
                <div className="flex items-center gap-0.5 mb-0">
                  <span className="text-[9px] md:text-[8px] font-semibold" style={{ color: 'var(--accent)' }}>{senderInfo?.firstName}</span>
                  {(senderId === groupAdmin) && <IoIosStar className="text-amber-400 text-[8px]" />}
                </div>
              )}
              <div className="text-xs md:text-[10px] leading-snug whitespace-pre-wrap break-words">{text}</div>
              <div className="flex justify-end mt-0.5">
                <span className="text-[8px] md:text-[7px] tabular-nums leading-none" style={{ color: 'var(--text-muted)' }}>{convertToIST(time)}</span>
              </div>
            </div>

            {/* Reaction chip */}
            {reaction && (
              <div className="flex items-center bg-white border border-black/[0.08] rounded-full px-1.5 py-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] -mt-2 ml-1 z-10">
                <span className="text-sm leading-none">{reaction}</span>
              </div>
            )}
          </div>

          {/* Hover quick reactions */}
          <div className="hover-reveal flex items-center gap-0.5 self-end mb-0.5">
            {["👍", "❤️", "😂"].map(r => (
              <button key={r} {...commonEmojiProps(r)} title={r}>{r}</button>
            ))}
          </div>
        </div>
      )}

      {/* Reaction picker */}
      {isThisChatSelected && (
        <div ref={reactionMenu} className="reaction absolute -top-15 md:-top-12 left-auto z-50 w-[21rem] md:w-72">
          <Reactions addReaction={addReaction} id={_id} prevReaction={reaction} />
        </div>
      )}
    </div>
  )
}
