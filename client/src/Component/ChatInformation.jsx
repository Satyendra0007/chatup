import { IoMdClose } from "react-icons/io";
import Member from "./Member";
import { useUser } from "@clerk/clerk-react";
import userimage from "../assets/user.png"
import { HiUserAdd } from "react-icons/hi";

export default function ChatInformation({ setShowChatInfo, name, imageUrl, email, receiverId, isGroup, members, groupAdmin }) {
  const { user } = useUser();
  return (
    <div className='w-full h-full bg-[var(--bg-surface)]'>
      <div className="close flex justify-end p-2">
        <button
          className="p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-lg transition-colors"
          onClick={() => setShowChatInfo(prev => !prev)}>
          <IoMdClose />
        </button>
      </div>

      <div className="info flex flex-col items-center my-2">
        <div className="image">
          <img className="w-40 h-40 rounded-full shadow-[var(--shadow-md)] ring-2 ring-[var(--border-soft)]" src={imageUrl || userimage} alt="user" />
        </div>
        <div className="name text-xl font-bold mt-2 capitalize text-[var(--text-primary)]">{name} </div>
        <div className="email text-sm text-[var(--text-secondary)]">
          {isGroup ? members.length + " Members " : email}
        </div>
      </div>

      {isGroup && <>
        {user.id === groupAdmin &&
          <div className="adduser flex justify-center px-4">
            <button className='flex gap-1.5 items-center justify-center py-2 primary-bg text-white w-full border border-[var(--accent)] rounded-xl text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)]'>
              <div className="text text-sm">Add User</div>
              <div className="text-base"><HiUserAdd /></div>
            </button>
          </div>
        }

        <div className="members">
          <div className="head">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider my-3 text-center">Members</h2>
          </div>
          <div className="list flex flex-col items-center gap-1">
            <Member  {...user} groupAdmin={groupAdmin} />
            {members.map(member => {
              if (member.id === user.id) return
              return <Member key={member.id} {...member} groupAdmin={groupAdmin} />
            })}
          </div>
        </div>
      </>
      }
    </div>
  )
}
