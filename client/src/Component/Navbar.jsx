import React from 'react'
import { useClerk, useUser, UserButton } from '@clerk/clerk-react'
import { IoChatbubbleSharp } from "react-icons/io5";

export default function Navbar() {
  const { openSignIn, openSignUp } = useClerk();
  const { isSignedIn } = useUser();

  return (
    <header className='flex justify-between items-center px-5 py-3 md:py-5 bg-white'>
    
      <div className="logo text-xl md:text-2xl flex items-center gap-1 border-1 bg-green-100 shadow-lg border-green-400 px-3 py-1 rounded-full  ">
        <div className="text font-bold logo-font">ChatUp</div>
        <div className="icon text-green-700 "><IoChatbubbleSharp /></div>
      </div>

      <div className="button flex gap-2 md:gap-4">
        {(!isSignedIn) ? <>
          <button onClick={() => openSignIn()} className='  cursor-pointer py-2 px-6 md:px-8 bg-slate-200 text-sm md:text-base  btn-rounded hover:bg-slate-300'>Login</button>
          <button onClick={() => openSignUp()} className='primary-bg px-4 md:px-6 py-2 btn-rounded   text-white text-sm md:text-base cursor-pointer hover:opacity-95'>Get Started</button>
        </> : <>
          <div className="user scale-140">
            <UserButton />
          </div>
        </>}
      </div>
    </header>
  )
}
