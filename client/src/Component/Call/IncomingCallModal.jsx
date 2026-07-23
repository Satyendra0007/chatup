import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCall } from "../../Context/CallContext";
import { CALL_STATUS } from "../../webrtc/constants";
import { MdCall, MdCallEnd } from "react-icons/md";

export default function IncomingCallModal() {
  const { callState, activeCall, acceptCall, rejectCall } = useCall();

  const isRinging = callState === CALL_STATUS.RINGING && activeCall?.isIncoming;

  return (
    <AnimatePresence>
      {isRinging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-2xl shadow-[var(--shadow-lg)] p-6 flex flex-col items-center text-center"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full animate-ping bg-[var(--accent)] opacity-20"></div>
              <img
                src={activeCall?.peerInfo?.avatar || "https://via.placeholder.com/150"}
                alt="Caller"
                className="w-24 h-24 rounded-full object-cover shadow-[var(--shadow-md)] border-4 border-[var(--bg-page)] relative z-10"
              />
            </div>
            
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {activeCall?.peerInfo?.name || "Unknown"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              Incoming {activeCall?.isVideo ? "Video" : "Voice"} Call...
            </p>

            <div className="flex w-full justify-center gap-8">
              <button
                onClick={rejectCall}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:bg-rose-600 transition-colors">
                  <MdCallEnd className="text-2xl" />
                </div>
                <span className="text-xs text-[var(--text-muted)] font-medium">Decline</span>
              </button>

              <button
                onClick={acceptCall}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:bg-emerald-600 transition-colors animate-bounce">
                  <MdCall className="text-2xl" />
                </div>
                <span className="text-xs text-[var(--text-muted)] font-medium">Accept</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
