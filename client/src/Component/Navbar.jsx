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
      <header className='flex justify-between items-center px-5 py-3 md:py-4 bg-transparent'>
        <div className="logo text-base md:text-lg flex items-center gap-1.5 bg-[var(--bg-active)] border border-[var(--accent-muted)] px-3 py-1 rounded-full shadow-[var(--shadow-xs)]">
          <div className="text font-semibold logo-font text-[var(--accent-dark)]">ChatUp</div>
          <div className="icon text-[var(--accent)] text-sm"><IoChatbubbleSharp /></div>
        </div>

        <div className="button flex gap-2 md:gap-3 items-center">
          {(!isSignedIn) ? <>
            <button onClick={() => openSignIn()} className='cursor-pointer py-1.5 px-5 md:px-6 bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm md:text-sm btn-rounded transition-colors shadow-[var(--shadow-xs)]'>Login</button>
            <button onClick={() => openSignUp()} className='primary-bg px-4 md:px-5 py-1.5 btn-rounded text-white text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-xs)]'>SignUp</button>
          </> : <>
            <div className="flex items-center gap-2">
              {!isNotificationGranted && (
                <button
                  onClick={() => setShowModal(true)}
                  className="p-1.5 bg-rose-50 text-rose-500 border border-rose-200 rounded-full text-base cursor-pointer hover:bg-rose-100 transition-colors"
                  title="Enable notifications"
                >
                  <IoNotificationsOffOutline />
                </button>
              )}
              <UserButton />
            </div>
          </>}
        </div>
      </header>

      {showModal && (
        <div className="modal absolute top-0 left-0 bg-[var(--bg-surface)]/95 backdrop-blur-sm w-full px-6 py-5 flex justify-center items-center flex-col gap-4 border-b border-[var(--border-soft)] shadow-[var(--shadow-sm)] z-50">
          <div className="info flex items-center gap-3">
            <div className="image">
              <img className='rounded-full w-16' src={notification} alt="" />
            </div>
            <div className="text-sm text-[var(--text-secondary)] text-center">
              Enable notifications to get instant message alerts 📩
            </div>
          </div>
          <div className="button flex gap-3">
            <button onClick={askNotificationPermission} className='px-5 py-2 primary-bg rounded-full text-white text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)]'>Enable 😊</button>
            <button onClick={() => setShowModal(false)} className='px-5 py-2 bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-full text-sm cursor-pointer hover:text-[var(--text-primary)] transition-colors'>Ignore 🙄</button>
          </div>
        </div>
      )}
    </>
  )
}
