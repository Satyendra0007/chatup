import React, { useState } from 'react'
import { useClerk, useUser, UserButton } from '@clerk/clerk-react'
import { IoChatbubbleSharp } from "react-icons/io5";
import { IoNotificationsOffOutline } from "react-icons/io5";
import notification from "../assets/notification.gif"

export default function Navbar() {
  const { openSignIn, openSignUp } = useClerk();
  const { isSignedIn } = useUser();
  const isNotificationGranted = Notification.permission === "granted"
  const [showModal, setShowModal] = useState(false);

  const askNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Notifications Enabled!", {
            body: "You’ll now get chat alerts 🎉",
          });
          setShowModal(false)
        }
      });
    }
  };

  return (
    <>
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
            <div className=" flex  items-center gap-3 scale-150 mr-3">
              {!isNotificationGranted && <button onClick={() => setShowModal(true)} className="button p-1.5 bg-rose-500 text-white rounded-full text-md cursor-pointer"><IoNotificationsOffOutline /></button>}
              <UserButton />
            </div>
          </>}
        </div>
      </header>

      {showModal && <div className="modal absolute top-0 left-0 bg-white w-full px-6 py-4 flex justify-center items-center flex-col gap- shadow-md">
        <div className="info flex items-center gap-2">
          <div className="image ">
            <img className='rounded-full w-40' src={notification} alt="" />
          </div>
          <div className=" md:text-sm text-center">
            Enable Notification to get Instant Messages 📩
          </div>
        </div>
        <div className="button space-x-16  md:space-x-8 " >
          <button onClick={askNotificationPermission} className='px-6 py-2.5 bg-green-600 rounded-full text-white text-sm md:text-xs shadow-lg cursor-pointer hover:opacity-85'>Enable😊</button>
          <button onClick={() => setShowModal(false)} className='px-6 py-2.5 bg-red-600 rounded-full text-white text-sm md:text-xs shadow-lg cursor-pointer hover:opacity-85'>Ignore🙄</button>
        </div>
      </div>}
    </>
  )
}
