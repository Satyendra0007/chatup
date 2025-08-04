import React from 'react'
import user from "@/assets/user.png"
import { useClerk, useUser, UserButton } from '@clerk/clerk-react'

export default function Navbar() {
  const { openSignIn, openSignUp } = useClerk();
  const { isSignedIn } = useUser();

  return (
    <header className='flex justify-between items-center px-5 py-5'>
      <div className="logo text-xl md:text-2xl font-bold primary-bg bg-clip-text text-transparent logo-font">ChatUp</div>
      <div className="button flex gap-2 md:gap-4">
        {(!isSignedIn) ? <>
          <button onClick={() => openSignIn()} className='  cursor-pointer py-2 px-6 md:px-8 bg-slate-200  btn-rounded hover:bg-slate-300'>Login</button>
          <button onClick={() => openSignUp()} className='primary-bg px-4 md:px-6 py-2 btn-rounded   text-white cursor-pointer hover:opacity-95'>Get Started</button>
        </> : <>
          <div className="user scale-140">
            <UserButton />
          </div>
        </>}
      </div>
    </header>
  )
}
