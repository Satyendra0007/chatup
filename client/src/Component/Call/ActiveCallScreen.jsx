import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCall } from "../../Context/CallContext";
import { CALL_STATUS } from "../../webrtc/constants";
import { MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import mediaManager from "../../webrtc/MediaManager";

// Helper to format duration in mm:ss
const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function ActiveCallScreen() {
  const { callState, activeCall, localStream, remoteStream, callDuration, endCall } = useCall();
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const isActive = [
    CALL_STATUS.CALLING,
    CALL_STATUS.CONNECTING,
    CALL_STATUS.CONNECTED,
    CALL_STATUS.RECONNECTING,
  ].includes(callState);

  // Attach remote stream to video element when it changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn("Remote autoplay prevented", e));
    }
  }, [remoteStream, callState]);

  // Attach local stream to PIP video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn("Local autoplay prevented", e));
    }
  }, [localStream, callState]);

  if (!isActive) return null;

  const handleToggleMute = () => {
    mediaManager.toggleAudio(isMuted);
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    // Only if it's a video call, though this file currently is focused on Voice mainly
    // We will expand this in Phase 3 for full video rendering
    mediaManager.toggleVideo(isVideoOff);
    setIsVideoOff(!isVideoOff);
  };

  const getStatusText = () => {
    switch (callState) {
      case CALL_STATUS.CALLING: return "Calling...";
      case CALL_STATUS.CONNECTING: return "Connecting...";
      case CALL_STATUS.CONNECTED: return formatDuration(callDuration);
      case CALL_STATUS.RECONNECTING: return "Reconnecting...";
      default: return "";
    }
  };

  const isVideoCall = activeCall?.isVideo;
  const showRemoteVideo = isVideoCall && callState === CALL_STATUS.CONNECTED && remoteStream && remoteStream.getVideoTracks().length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] bg-[var(--bg-page)] flex flex-col">
        {/* Remote Media Element */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className={`absolute inset-0 w-full h-full object-cover z-0 ${showRemoteVideo ? 'opacity-100' : 'opacity-0'}`} 
        />

        {/* Header */}
        <div className="pt-12 pb-6 px-6 text-center flex-shrink-0 relative z-10 bg-gradient-to-b from-black/50 to-transparent">
          <h2 className="text-2xl font-bold text-white shadow-sm">
            {activeCall?.peerInfo?.name || "Unknown"}
          </h2>
          <p className={`text-sm mt-1 font-medium ${callState === CALL_STATUS.CONNECTED ? 'text-emerald-400' : 'text-gray-300'}`}>
            {getStatusText()}
          </p>
        </div>

        {/* Center content (Avatar / Video Fallback) */}
        <div className="flex-1 flex items-center justify-center relative p-6 pointer-events-none z-10">
          {!showRemoteVideo && (
            <div className="relative">
              {callState === CALL_STATUS.CALLING && (
                <div className="absolute inset-0 rounded-full animate-ping bg-[var(--accent)] opacity-20"></div>
              )}
              <img
                src={activeCall?.peerInfo?.avatar || "https://via.placeholder.com/150"}
                alt="Avatar"
                className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-[var(--shadow-lg)] border-4 border-white/20 relative z-10"
              />
            </div>
          )}
        </div>

        {/* Local Video PIP (if video call) */}
        {isVideoCall && callState === CALL_STATUS.CONNECTED && (
          <div className="absolute bottom-36 right-6 w-28 h-40 md:w-36 md:h-48 bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-[var(--border-medium)] z-20">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <MdVideocamOff className="text-white text-3xl opacity-50" />
              </div>
            )}
          </div>
        )}

        {/* Controls Panel */}
        <div className="h-32 bg-[var(--bg-surface)] border-t border-[var(--border-soft)] rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-center gap-6 md:gap-10 px-6 relative z-10">
          
          <button 
            onClick={handleToggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors shadow-sm cursor-pointer ${
              isMuted 
                ? "bg-[var(--bg-active)] text-[var(--text-primary)]" 
                : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-active)]"
            }`}
          >
            {isMuted ? <MdMicOff /> : <MdMic />}
          </button>

          <button 
            onClick={() => endCall("Hung up")}
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white bg-rose-500 hover:bg-rose-600 shadow-lg cursor-pointer transition-transform hover:scale-105"
          >
            <MdCallEnd />
          </button>

          {activeCall?.isVideo ? (
             <button 
             onClick={handleToggleVideo}
             className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors shadow-sm cursor-pointer ${
               isVideoOff 
                 ? "bg-[var(--bg-active)] text-[var(--text-primary)]" 
                 : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-active)]"
             }`}
           >
             {isVideoOff ? <MdVideocamOff /> : <MdVideocam />}
           </button>
          ) : (
            <div className="w-14 h-14" /> // Placeholder for balance
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}
