import React, { useState } from 'react'
import { useClerk, useUser, UserButton } from '@clerk/clerk-react'
import { IoChatbubbleSharp } from "react-icons/io5";
import { IoNotificationsOffOutline } from "react-icons/io5";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import { useTheme } from "../Context/ThemeProvider";
import { motion, AnimatePresence } from "motion/react";
import notification from "../assets/notification.gif"

export default function Navbar() {
  const { openSignIn, openSignUp } = useClerk();
  const { isSignedIn } = useUser();
  const { theme, setTheme } = useTheme();
  const isNotificationGranted = Notification.permission === "granted"
  const [showModal, setShowModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

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
        <div className="logo text-base md:text-lg flex items-center gap-1.5 bg-[var(--bg-active)] border border-[var(--border-medium)] px-3 py-1 rounded-full shadow-[var(--shadow-xs)]">
          <div className="text font-semibold logo-font text-[var(--accent-dark)]">ChatUp</div>
          <div className="icon text-[var(--accent)] text-sm"><IoChatbubbleSharp /></div>
        </div>

        <div className="button flex gap-2 md:gap-3 items-center">
          {(!isSignedIn) ? <>
            <button onClick={() => openSignIn()} className='cursor-pointer py-1.5 px-5 md:px-6 bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm md:text-sm btn-rounded transition-colors shadow-[var(--shadow-xs)]'>Login</button>
            <button onClick={() => openSignUp()} className='primary-bg px-4 md:px-5 py-1.5 btn-rounded text-white text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-xs)]'>SignUp</button>
          </> : <>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-1.5 md:p-2 bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-soft)] rounded-full text-base cursor-pointer hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors shadow-[var(--shadow-xs)]"
                  title="Theme Settings"
                >
                  {theme === 'light' ? <FiSun /> : theme === 'dark' ? <FiMoon /> : <FiMonitor />}
                </button>
                <AnimatePresence>
                  {showThemeMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-36 bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-xl shadow-[var(--shadow-md)] z-50 overflow-hidden flex flex-col py-1"
                      >
                        {[
                          { id: 'light', label: 'Light', icon: <FiSun /> },
                          { id: 'dark', label: 'Dark', icon: <FiMoon /> },
                          { id: 'system', label: 'System', icon: <FiMonitor /> }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                            className={`flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                              theme === t.id
                                ? 'bg-[var(--bg-active)] text-[var(--accent-dark)] font-medium'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {t.icon}
                            <span>{t.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {!isNotificationGranted && (
                <button
                  onClick={() => setShowModal(true)}
                  className="p-1.5 md:p-2 bg-rose-50 text-rose-500 border border-rose-200 rounded-full text-base cursor-pointer hover:bg-rose-100 transition-colors shadow-[var(--shadow-xs)]"
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
