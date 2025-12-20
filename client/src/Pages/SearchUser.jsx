import Navbar from "@/Component/Navbar";
import User from "@/Component/User";
import { useConversationsStore } from "@/Context/ConversationsStore";
import { useState } from "react";
import { LuUserSearch } from "react-icons/lu";
import { HiUserAdd } from "react-icons/hi";
import { MdGroupAdd } from "react-icons/md";
import UserBadge from "@/Component/UserBadge";
import toast from "react-hot-toast";
import { useUser } from "@clerk/clerk-react";
import { useAxiosClient } from "@/utils/useAxiosClient";
import Spinner from "@/spinners/Spinner";


export default function SearchUser() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null)
  const { fetchConversations } = useConversationsStore()
  const [isGroup, setIsGroup] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [name, setName] = useState("")
  const axiosClient = useAxiosClient();

  const searchUser = async () => {
    setLoading(true)
    try {
      const response = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/user/search?email=${search}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserData(response?.data)
      }
    } catch (error) {
      console.log(error)
      toast.error("User Not Found")
    }
    setLoading(false)
  }

  const createConversation = async (members) => {
    setLoading(true)
    let data;
    if (!isGroup) {
      data = {
        members: members
      }
    }
    else {
      if (selectedUsers.length < 2) {
        toast.error("Select Atleast Two Members")
        setLoading(false)
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
      const response = await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/conversation/create`,
        data,
        {
          withCredentials: true,
        }
      );
      fetchConversations();
      if (isGroup) {
        toast.success("Group Created !")
        setName("")
        setSelectedUsers([])
      }
      else {
        toast.success("User Added !")
      }
      setUserData(null)
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

  const removeUser = (id) => {
    setSelectedUsers(prev => prev.filter(user => user.id != id))
  }

  return (
    <div className="md:my-10 relative">
      {loading && <Spinner />}
      <div className="navbar md:hidden pt-3">
        <Navbar />
      </div>

      <div className="button p-3 flex  justify-center">
        <button
          className={` bg-gray-200 ${!isGroup ? "primary-bg text-white " : ""} flex justify-center items-center gap-2 py-3 w-40 rounded-l-full cursor-pointer shadow-lg transition-all duration-150 ease-in-out`}
          onClick={() => setIsGroup(false)}
        >
          <span>Friend</span>
          <HiUserAdd />
        </button>
        <button
          className={` bg-gray-300 ${isGroup ? "primary-bg text-white " : ""} flex justify-center items-center gap-2 py-3 w-40 rounded-r-full cursor-pointer shadow-lg transition-all duration-150 ease-in-out`}
          onClick={() => setIsGroup(true)}
        >
          <span>Group</span>
          <MdGroupAdd />
        </button>
      </div>

      <div className="box flex flex-col items-center gap-4 ">

        {isGroup && <>
          <div className="grid mt-4">
            <label className='text-sm m-1' htmlFor="name">Group Name  </label>
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder='Enter The Group Name '
              className=' border border-gray-300 w-80 h-12 px-4 rounded-full shadow-lg md:w-96 md:h-11 md:text-sm focus:ring-1 focus:ring-green-500 outline-none transition-all ease-out duration-100 '
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
            disabled={!name || loading}
            className="px-6 py-3 primary-bg text-white rounded-full cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            Create Group
          </button>
        </>
        }

        <div className="search flex justify-center items-center w-80 h-12 md:w-96 md:h-11 border border-gray-300 rounded-full my-5 focus-within:ring-1 focus-within:ring-green-500 shadow-lg transition-all ease-out duration-100">
          <input
            type="email"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            placeholder='Enter The Email '
            className=' px-4 md:text-sm outline-none flex-grow min-w-0'
          />
          <button disabled={!search || loading} onClick={searchUser} className="p-3 md:p-2 primary-bg text-white text-2xl rounded-full cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ">
            <LuUserSearch />
          </button>
        </div>

        <div className="result my- flex justify-center">
          {userData && <User {...userData} createConversation={createConversation} isGroup={isGroup} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} setSearch={setSearch} />}
        </div>
      </div>

    </div>
  )
}
