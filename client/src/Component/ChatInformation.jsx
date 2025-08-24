import { IoMdClose } from "react-icons/io";
import Member from "./Member";
import { useUser } from "@clerk/clerk-react";
import userimage from "../assets/user.png"
import { HiUserAdd } from "react-icons/hi";

export default function ChatInformation({ setShowChatInfo, name, imageUrl, email, receiverId, isGroup, members, groupAdmin }) {
  const { user } = useUser();
  return (
    <div className='absolute top-0 left-0 w-full z-50 bg-white bottom-0'>
      <div className="close flex justify-end p-2 ">
        <button
          className="p-2 rounded-full primary-bg text-white text-lg"
          onClick={() => setShowChatInfo(prev => !prev)}>
          <IoMdClose />
        </button>
      </div>

      <div className="info flex flex-col items-center my-2">
        <div className="image">
          <img className="w-40 h-40 rounded-full" src={imageUrl || userimage} alt="user" />
        </div>
        <div className="name text-xl font-bold mt-2 capitalize">{name} </div>
        <div className="email text-sm">
          {isGroup ? members.length + " Members " : email}
        </div>
      </div>

      {isGroup && <>
        {user.id === groupAdmin &&
          <div className="adduser flex justify-center">
            <button className='flex gap-1 items-center justify-center py-2 bg-green-600  text-white w-[21rem]  border rounded-full cursor-pointer hover:bg-green-700'>
              <div className="text md:text-sm"> Add User </div>
              <div className="text-lg"><HiUserAdd /></div>
            </button>
          </div>
        }

        <div className="members">
          <div className="head">
            <h1 className="font-semibold text-lg my-3 text-center">Members</h1>
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
