import user from "@/assets/user.png"
import { HiUserAdd } from "react-icons/hi";
import { useUser } from "@clerk/clerk-react";
import { MdDone } from "react-icons/md";
import { useConversationsStore } from "@/Context/ConversationsStore";

export default function User({ firstName, lastName, email, imageUrl, id, createConversation, isGroup, selectedUsers, setSelectedUsers, setSearch }) {
  const { user } = useUser();
  const { conversations } = useConversationsStore()

  const handleOnClick = () => {
    if (isGroup) {
      setSelectedUsers((prev) => [...prev, { id, firstName, imageUrl, email }])
    }
    else {
      createConversation([user.id, id])
    }
    setSearch("")
  }

  const isAlreadyAdded = selectedUsers.find(user => user.id === id)
  const userAlreadyAdded = conversations.find((conversation) => (conversation.receiverId === id && !isGroup))

  return (
    <div className="flex justify-between items-center px-3 py-2 bg-[var(--bg-surface)] w-[21rem] border border-[var(--border-medium)] rounded-xl shadow-[var(--shadow-sm)] hover:bg-[var(--bg-hover)] transition-colors">
      <div className="info flex gap-3 items-center">
        <div className="image">
          <img className="w-10 h-10 rounded-full object-cover" src={imageUrl} alt="" />
        </div>
        <div className="info">
          <h3 className="font-medium text-sm text-[var(--text-primary)] capitalize">{firstName + " " + lastName}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{email}</p>
        </div>
      </div>
      <div className="button">
        {(user.id !== id) && <button
          disabled={isAlreadyAdded || userAlreadyAdded}
          onClick={handleOnClick}
          className='p-1.5 primary-bg text-white text-xl rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-[var(--shadow-xs)]'
        >
          {(isAlreadyAdded || userAlreadyAdded) ? <MdDone /> : <HiUserAdd />}
        </button>}
      </div>
    </div>
  )
}
