import Navbar from "@/Component/Navbar";
import User from "@/Component/User";
import { useConversationsStore } from "@/Context/ConversationsStore";
import axios from "axios";
import { useState } from "react";
import { LuUserSearch } from "react-icons/lu";
import { HiUserAdd } from "react-icons/hi";
import { MdGroupAdd } from "react-icons/md";
import UserBadge from "@/Component/UserBadge";
import toast from "react-hot-toast";
import { useUser } from "@clerk/clerk-react";

export default function SearchUser() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState(null)
  const { fetchConversations } = useConversationsStore()
  const [isGroup, setIsGroup] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [name, setName] = useState("")

  const searchUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}api/user/search?email=${search}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserData(response?.data)
      }
    } catch (error) {
      console.log(error)
      toast.error("User Not Found")
    }
  }

  const createConversation = async (members) => {
    let data;
    if (!isGroup) {
      data = {
        members: members
      }
    }
    else {
      if (selectedUsers.length < 2) {
        toast.error("Select Atleast Two Members")
        return
      }
      data = {
        name: name,
        members: [...selectedUsers.map(user => user.id), user.id],
        groupAdmin: user.id,
        isGroup: true
      }
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}api/conversation/create`,
        data,
        {
          withCredentials: true,
        }
      );
      fetchConversations();
      if (isGroup) {
        toast("Group Created !")
        setName("")
        setSelectedUsers([])
      }
      setUserData(null)
    } catch (error) {
      console.log(error)
    }
  }

  const removeUser = (id) => {
    setSelectedUsers(prev => prev.filter(user => user.id != id))
  }

  return (
    <div className="md:my-10">
      <div className="navbar md:hidden">
        <Navbar />
      </div>

      <div className="button p-3 flex  justify-center">
        <button
          className={`${!isGroup ? "primary-bg text-white " : "bg-gray-200"} flex justify-center items-center gap-2 py-3 w-40 rounded-l-full cursor-pointer `}
          onClick={() => setIsGroup(false)}
        >
          <span>Friend</span>
          <HiUserAdd />
        </button>
        <button
          className={`${isGroup ? "primary-bg text-white " : "bg-gray-300"} flex justify-center items-center gap-2 py-3 w-40 rounded-r-full cursor-pointer `}
          onClick={() => setIsGroup(true)}
        >
          <span>Group</span>
          <MdGroupAdd />
        </button>
      </div>

      <div className="box flex flex-col items-center gap-4 ">

        {isGroup && <>
          <div className="grid">
            <label className='text-sm ' htmlFor="name">Group Name  </label>
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder='Enter The Group Name '
              className=' border border-gray-400 w-80 h-12 px-2.5 rounded-lg shadow-lg md:w-96 md:h-10 md:text-sm'
            />
          </div>

          <div className="members  ">
            <div className="heading text-center">Members</div>
            <div className="list my-3 px-2 flex items-center gap-2 overflow-scroll hide-scrollbar ">
              {selectedUsers?.length > 0 && selectedUsers.map(user => {
                return <UserBadge key={user.id} {...user} removeUser={removeUser} />
              })}
            </div>
          </div>

          <button
            onClick={createConversation}
            disabled={!name}
            className="px-6 py-3 primary-bg text-white rounded-full cursor-pointer disabled:opacity-90">
            Create Group
          </button>
        </>
        }

        <div className="search flex justify-center ">
          <div className="input">
            <input
              type="email"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              placeholder='Enter The Email '
              className='border border-gray-400 w-72 h-12 px-2.5 rounded-l-lg shadow-lg md:w-96 md:h-10 md:text-sm'
            />
          </div>
          <div className="button">
            <button disabled={!search} onClick={searchUser} className="p-3 md:p-2 primary-bg text-white text-2xl rounded-r-lg  cursor-pointer disabled:opacity-90 ">
              <LuUserSearch />
            </button>
          </div>
        </div>

        <div className="result my-5 flex justify-center">
          {userData && <User {...userData} createConversation={createConversation} isGroup={isGroup} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} setSearch={setSearch} />}
        </div>
      </div>

    </div>
  )
}
