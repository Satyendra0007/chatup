import { motion, AnimatePresence } from "motion/react";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { FiWifiOff } from "react-icons/fi";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm pointer-events-none"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <FiWifiOff className="text-red-400 text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold leading-tight">Waiting for network</span>
              <span className="text-slate-300 text-[10px] leading-snug">Viewing cached content</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
