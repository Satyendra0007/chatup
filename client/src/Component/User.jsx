import user from "@/assets/user.png"
import { HiUserAdd } from "react-icons/hi";
import { useUser } from "@clerk/clerk-react";
import { MdDone } from "react-icons/md";

export default function User({ firstName, lastName, email, imageUrl, id, createConversation, isGroup, selectedUsers, setSelectedUsers, setSearch }) {
  const { user } = useUser();

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

  return (
    <div className=" flex justify-between items-center px-2  py-1.5 bg-slate-50 w-[21rem]  border border-gray-400 rounded-2xl ">
      <div className="info flex gap-4">
        <div className="image ">
          <img className="w-12 md:w-10 h-12 md:h-10 rounded-full" src={imageUrl} alt="" />
        </div>
        <div className="info">
          <h3 className="font-semibold md:text-sm capitalize">{firstName + " " + lastName}</h3>
          <p className="text-xs md:text-[10px]">{email}</p>
        </div>
      </div>
      <div className="button">
        {(user.id !== id) && <button
          disabled={isAlreadyAdded}
          onClick={handleOnClick}
          className='p-1.5 primary-bg text-white text-2xl rounded-full cursor-pointer'
        >
          {isAlreadyAdded ? <MdDone /> : <HiUserAdd />}
        </button>}
      </div>
    </div>
  )
}
