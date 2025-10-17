import { Link } from "react-router-dom"
import ai from "../assets/ai.gif"
import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { BsFillSendFill } from "react-icons/bs";
import AiResponse from "@/Component/AiResponse";
import { useAxiosClient } from "@/utils/useAxiosClient";
import thinking from "../assets/thinking.gif"
import toast from "react-hot-toast";

export default function AiChat() {
  const chatRef = useRef(null);
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [responseList, setResponseList] = useState([])
  const axiosClient = useAxiosClient();

  const scrollChat = (value) => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: value,
        behavior: "smooth",
      });
    }
  }

  const handleOnClick = async () => {
    setLoading(true)
    const dummyId = new Date().getTime();
    setResponseList(prev => [...prev, { _id: dummyId, prompt, response: "" }])
    const dummyPrompt = prompt
    setPrompt("")
    // scrollChat(chatRef.current.scrollHeight + 800)
    try {
      const { data } = await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/ai`, {
        prompt: dummyPrompt
      }, {
        withCredentials: true,
      })
      setResponseList(prev => prev.map(response => response._id === dummyId ? data : response))
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const fetchResponses = async () => {
    try {
      const { data } = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/ai`, {
        withCredentials: true,
      })
      setResponseList(data)
      // scrollChat(chatRef.current.scrollHeight)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteResponse = async (id) => {
    try {
      const { data } = await axiosClient.delete(`${import.meta.env.VITE_SERVER_URL}api/ai/${id}`, {
        withCredentials: true,
      })
      setResponseList(prev => prev.filter(response => response._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Text Copied")
  }

  useEffect(() => {
    fetchResponses()
  }, [])

  useEffect(() => {
    // scrollChat(chatRef.current.scrollHeight)
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight + 200,
        behavior: "smooth",
      });
    }
  }, [responseList, loading])


  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      <div className="header py-2 px-3 md:px-6 md:gap-4 md:p-1.5 bg-white shadow-md">
        <div className=" user flex items-center md:gap-4">
          <Link to="/conversation" >
            <div className="button text-xl h-11 w-11 flex-shrink-0 flex justify-center items-center  bg-gray-200 rounded-full shadow-xl">
              <FaArrowLeft />
            </div>
          </Link>
          <div className="flex gap-4 px-2 items-center ">
            <div className="image ">
              <img className="w-12 h-12 rounded-full" src={ai} alt="" />
            </div>
            <div className="name">
              <h3 className="font-semibold text-xl">AI</h3>
            </div>
          </div>
        </div>
      </div>

      <div ref={chatRef} className="chats h-full p-2 overflow-scroll hide-scrollbar pb-12 space-y-6">
        {(responseList.length === 0)
          ? <h1 className="text-xl font-semibold text-center mt-4"> How Can I Help You ? </h1>
          : responseList.map(response => <AiResponse key={response._id} {...response} handleCopy={handleCopy} deleteResponse={deleteResponse} />)
        }
        {loading && <div> <img className="w-7 ml-3" src={thinking} alt="" /></div>}
      </div>

      <div className="chatbox sticky bottom-3 z-40 left-0 w-full px-3">
        <div className="flex items-center justify-between gap-3 bg-white  rounded-3xl shadow-xl pl-4 pr-1 py-1 md:py-0.5 border border-green-400 focus-within:ring-1 focus-within:ring-green-500  transition-all duration-300">

          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            placeholder="Ask anything"
            className="flex-grow min-w-0 bg-transparent outline-none text-base placeholder-gray-400 "
          />

          <button
            disabled={!prompt || loading}
            onClick={handleOnClick}
            className="sendbutton p-3 rounded-full primary-bg active:scale-95 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BsFillSendFill className="text-xl text-white" />
          </button>
        </div>
      </div>


    </div>
  )
}
