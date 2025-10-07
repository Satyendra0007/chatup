import "../style/markdown.css"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ai from "../assets/ai.gif"
import { FaRegCopy } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { useUser } from "@clerk/clerk-react"

export default function AiResponse({ _id, prompt, response, handleCopy }) {
  const { user } = useUser()

  return (
    <div className='space-y-3'>
      <div className="prompt flex justify-end items-center gap-3">
        <div className="text max-w-[85%] md:max-w-[75%] min-w-24 md:min-w-32 bg-green-200 px-3 py-2  rounded-2xl rounded-tr-none  md:text-sm">
          <p>{prompt}</p>
        </div>
        <div className="imgage">
          <img className="w-7 rounded-full" src={user?.imageUrl} alt="" />
        </div>
      </div>
      {response && <div className="response flex md:ml-5 gap-2">
        <div className="image">
          <img className="w-6 md:w-8 rounded-full flex-shrink-0" src={ai} alt="" />
        </div>
        <div className="text  max-w-[85%] md:max-w-[75%] bg-gray-100 p-3 rounded-sm ">
          <div className="markdown max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response}
            </ReactMarkdown>
          </div>
          <div className="button text-right space-x-2 py-2">
            <button onClick={() => handleCopy(response)} className="p-2 border rounded-full border-gray-400 cursor-pointer hover:bg-gray-200"><MdDeleteOutline /></button>
            <button onClick={() => handleCopy(response)} className="p-2 border rounded-full border-gray-400 cursor-pointer hover:bg-gray-200"><FaRegCopy /></button>
          </div>
        </div>
      </div>}

    </div>
  )
}
