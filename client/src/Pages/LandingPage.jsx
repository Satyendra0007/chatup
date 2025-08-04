import girl from "@/assets/girl.png"
import user from "@/assets/user.png"
import { BsFillSendCheckFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import Navbar from '@/Component/Navbar';
import { useClerk } from '@clerk/clerk-react'

export default function LandingPage() {
  const { openSignUp } = useClerk();

  return (
    <>
      <Navbar />
      <main className='md:flex justify-center items-center md:max-w-6xl mx-auto'>
        <div className="top h-94  relative md:w-1/2 md:h-[76vh] md:order-1 ">
          <div className="background h-full flex justify-center items-center relative mx-auto">
            <div className="circle h-80 w-80  primary-bg rounded-full md:h-96 md:w-96 lg:w-[26rem] lg:h-[26rem"></div>
          </div>
          <div className="image absolute z-10 top-0 h-full w-full ">
            <img className=' h-full mx-auto ' src={girl} alt="" />
          </div>
          <div className="message w-48 bg-white flex justify-center items-center backdrop-blur-lg absolute top-56  left-1/2 md:top-80 z-20 text-[10px] gap-2 rounded-md p-1">
            <img className='w-7 h-7 rounded-full ' src={user} alt="" />
            <p className=''>Lorem ipsum dolor sit amet jsklf kljf ksl ❤️ .</p>
          </div>
        </div>
        <div className="bottom flex flex-col gap-4 p-4 md:p-10 md:w-1/2  md:gap-y-10">
          <div className="text space-y-4 md:space-y-9">
            <h1 className='text-3xl font-semibold md:text-5xl md:leading-16'>Let's Connect with People in Real Time</h1>
            <p className='text-[12px] md:text-sm text-gray-800'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed recusandae, dicta doloribus dolor repellat vero molestias aliquam nulla labore earum quae?</p>
          </div>
          <div className="button flex gap-1 items-center">
            <button onClick={() => openSignUp()} className='primary-bg text-sm py-3 px-8 text-white rounded-full flex justify-center items-center gap-2 cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out'>
              <span>Start Chatting Now </span>
              <BsFillSendCheckFill className='text-md' />
            </button>
          </div>
        </div>
      </main>
      <footer className=' '>
        <div className=" text-center mx-auto absolute -bottom-5 md:bottom-2 w-full">
          <a className='text-white py-3  px-10 rounded-full primary-bg inline-flex justify-center items-center gap-1 text-xs hover:opacity-90 ' target='_blank' href="https://satyendra03.vercel.app/">
            <FaUser className='' />
            <span>About Me</span>
          </a>
        </div>
      </footer>
    </>
  )
}
