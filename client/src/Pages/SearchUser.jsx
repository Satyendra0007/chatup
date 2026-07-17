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

      {/* ── Modern segmented control ── */}
      <div className="button p-3 flex justify-center">
        <div className="inline-flex bg-[var(--bg-input)] rounded-xl p-1 gap-1 shadow-inner">
          <button
            className={`flex items-center gap-1.5 py-2 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 ${
              !isGroup
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
            onClick={() => setIsGroup(false)}
          >
            <HiUserAdd className="text-base" />
            <span>Friend</span>
          </button>
          <button
            className={`flex items-center gap-1.5 py-2 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 ${
              isGroup
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
            onClick={() => setIsGroup(true)}
          >
            <MdGroupAdd className="text-base" />
            <span>Group</span>
          </button>
        </div>
      </div>

      <div className="box flex flex-col items-center gap-4 ">

        {isGroup && <>
          <div className="grid mt-4">
            <label className='text-xs font-medium text-[var(--text-secondary)] mb-1.5 ml-1' htmlFor="name">Group Name</label>
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder='Enter a group name'
              className='border border-[var(--border-medium)] bg-[var(--bg-surface)] w-80 h-11 px-4 rounded-xl shadow-[var(--shadow-xs)] md:w-96 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] outline-none transition-all ease-out duration-150'
            />
          </div>

          <div className="members  ">
            <div className="heading text-center text-sm font-medium text-[var(--text-primary)]">Members</div>
            <div className="list my-3 px-2 flex items-center gap-2 overflow-scroll hide-scrollbar ">
              {selectedUsers?.length > 0 && selectedUsers.map(user => {
                return <UserBadge key={user.id} {...user} removeUser={removeUser} />
              })}
            </div>
          </div>

          <button
            onClick={createConversation}
            disabled={!name || loading}
            className="px-6 py-2 primary-bg text-white text-sm rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-medium">
            Create Group
          </button>
        </>
        }

        <div className="search flex justify-center items-center w-80 h-11 md:w-96 border border-[var(--border-medium)] bg-[var(--bg-surface)] rounded-xl my-5 focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-[var(--accent)] shadow-[var(--shadow-xs)] transition-all ease-out duration-150">
          <input
            type="email"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            placeholder='Search by email'
            className='px-4 text-sm outline-none flex-grow min-w-0 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)]'
          />
          <button disabled={!search || loading} onClick={searchUser} className="p-2.5 primary-bg text-white text-lg rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity m-0.5 shadow-sm">
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
