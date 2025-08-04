import Navbar from "@/Component/Navbar";
import User from "@/Component/User";
import { useConversationsStore } from "@/Context/ConversationsStore";
import axios from "axios";
import {  useState } from "react";
import { LuUserSearch } from "react-icons/lu";

export default function SearchUser() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null)
  const { fetchConversations } = useConversationsStore()

  const searchUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}api/user/search?email=${search}`, {
        withCredentials: true,
      });
      setUser(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const createConversation = async (members) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}api/conversation/create`,
        { members: members },
        {
          withCredentials: true,
        }
      );
      fetchConversations();
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="md:my-10">
      <div className="navbar md:hidden">
        <Navbar />
      </div>
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
          <button onClick={searchUser} className="p-3 md:p-2 primary-bg text-white text-2xl rounded-r-lg  cursor-pointer ">
            <LuUserSearch />
          </button>
        </div>
      </div>
      <div className="result my-5 flex justify-center">
        {user && <User {...user} createConversation={createConversation} />}
      </div>
    </div>
  )
}
