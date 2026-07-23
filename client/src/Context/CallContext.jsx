import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import signalingService from "../webrtc/SignalingService";
import mediaManager from "../webrtc/MediaManager";
import CallSession from "../webrtc/CallSession";
import { CALL_STATUS, CALL_RESPONSE, TIMEOUTS } from "../webrtc/constants";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useAxiosClient } from "../utils/useAxiosClient";

const CallContext = createContext();

export function CallProvider({ children }) {
  const { user } = useUser();
  const currentUserId = user?.id;
  const axiosClient = useAxiosClient();

  const [callState, setCallState] = useState(CALL_STATUS.IDLE);
  const [activeCall, setActiveCall] = useState(null); // { callId, sessionId, isVideo, peerInfo: { id, name, avatar } }
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  
  // Refs to avoid stale closures in socket listeners
  const callStateRef = useRef(callState);
  const activeCallRef = useRef(activeCall);
  const callSessionRef = useRef(null);
  const ringTimeoutRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (!currentUserId) return;

    // 1. Incoming Call Request
    signalingService.on("call-request", (payload) => {
      // If we are already in a call, send busy
      if (callStateRef.current !== CALL_STATUS.IDLE) {
        signalingService.sendCallResponse({
          callId: payload.callId,
          sessionId: payload.sessionId,
          callerId: payload.callerId,
          receiverId: currentUserId,
          status: CALL_RESPONSE.BUSY
        });
        return;
      }

      setCallState(CALL_STATUS.RINGING);
      setActiveCall({
        callId: payload.callId,
        sessionId: payload.sessionId,
        isVideo: payload.callType === 'video',
        callerSocketId: payload.callerSocketId,
        isIncoming: true,
        peerInfo: {
          id: payload.callerId,
          name: payload.callerName,
          avatar: payload.callerAvatar
        }
      });

      // Start ring timeout
      ringTimeoutRef.current = setTimeout(() => {
        handleEndCall("Missed call");
      }, TIMEOUTS.RINGING);
    });

    // 2. Call Response (Caller receives this)
    signalingService.on("call-response", async (payload) => {
      const active = activeCallRef.current;
      if (!active || active.callId !== payload.callId) return;

      if (payload.status === CALL_RESPONSE.ACCEPTED) {
        if (callStateRef.current !== CALL_STATUS.CALLING) return; // Prevent orphaned connections
        
        clearTimeout(ringTimeoutRef.current);
        setCallState(CALL_STATUS.CONNECTING);
        
        try {
          // Fetch dynamic TURN configuration
          let iceServers = null;
          try {
            const { data } = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/webrtc/config`);
            if (data?.iceServers && data.iceServers.length > 0) {
              iceServers = data.iceServers;
            }
          } catch (e) {
            console.error("Failed to fetch WebRTC config", e);
          }

          if (!iceServers) {
            toast.error("Failed to initialize call. Network configuration unavailable.");
            handleEndCall("Network error");
            return;
          }

          // Acquire media
          const stream = await mediaManager.acquireMedia(active.isVideo);
          setLocalStream(stream);
          
          // Impolite peer (caller)
          callSessionRef.current = new CallSession({
            callId: active.callId,
            sessionId: active.sessionId,
            isPolite: false, 
            callerId: currentUserId,
            receiverId: active.peerInfo.id,
            iceServers,
            onRemoteStream: (stream) => setRemoteStream(stream),
            onConnectionStateChange: handleConnectionStateChange
          });
          
          callSessionRef.current.addLocalStream(stream);

        } catch (err) {
          toast.error("Failed to access microphone/camera");
          handleEndCall("Media error");
        }
      } else {
        toast(payload.status === CALL_RESPONSE.BUSY ? "User is busy" : "Call declined");
        handleEndCall();
      }
    });

    // 3. WebRTC SDP and ICE
    signalingService.on("call-sdp", (payload) => {
      const session = callSessionRef.current;
      if (session && session.callId === payload.callId) {
        session.handleSdp(payload.description);
      }
    });

    signalingService.on("call-ice", (payload) => {
      const session = callSessionRef.current;
      if (session && session.callId === payload.callId) {
        session.handleIceCandidate(payload.candidate);
      }
    });

    // 4. Call End
    signalingService.on("call-end", (payload) => {
      const active = activeCallRef.current;
      if (active && active.callId === payload.callId) {
        cleanupCall();
      }
    });

    return () => {
      signalingService.offAll();
    };
  }, [currentUserId]);

  const handleConnectionStateChange = (state) => {
    if (state === "connected") {
      setCallState(CALL_STATUS.CONNECTED);
      // Start duration timer if not started
      if (!durationIntervalRef.current) {
        durationIntervalRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }
    } else if (state === "disconnected" || state === "failed") {
      setCallState(CALL_STATUS.RECONNECTING);
    } else if (state === "closed") {
      cleanupCall();
    }
  };

  // Start outgoing call
  const startCall = (peerId, peerName, peerAvatar, isVideo = false) => {
    if (callState !== CALL_STATUS.IDLE) return;
    
    const callId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    
    setCallState(CALL_STATUS.CALLING);
    setActiveCall({
      callId,
      sessionId,
      isVideo,
      isIncoming: false,
      peerInfo: { id: peerId, name: peerName, avatar: peerAvatar }
    });

    signalingService.sendCallRequest({
      callId,
      sessionId,
      callerId: currentUserId,
      receiverId: peerId,
      callType: isVideo ? 'video' : 'voice',
      callerName: user?.fullName || "User",
      callerAvatar: user?.imageUrl
    });

    ringTimeoutRef.current = setTimeout(() => {
      toast("No answer");
      handleEndCall("No answer");
    }, TIMEOUTS.RINGING);
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (callStateRef.current !== CALL_STATUS.RINGING) return; // Prevent double-clicks / orphaned sessions
    
    const active = activeCallRef.current;
    if (!active) return;
    
    clearTimeout(ringTimeoutRef.current);
    setCallState(CALL_STATUS.CONNECTING);
    
    try {
      // Fetch dynamic TURN configuration
      let iceServers = null;
      try {
        const { data } = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/webrtc/config`);
        if (data?.iceServers && data.iceServers.length > 0) {
          iceServers = data.iceServers;
        }
      } catch (e) {
        console.error("Failed to fetch WebRTC config", e);
      }

      if (!iceServers) {
        toast.error("Failed to answer call. Network configuration unavailable.");
        handleEndCall("Network error");
        return;
      }

      const stream = await mediaManager.acquireMedia(active.isVideo);
      setLocalStream(stream);

      // Polite peer (receiver)
      callSessionRef.current = new CallSession({
        callId: active.callId,
        sessionId: active.sessionId,
        isPolite: true, 
        callerId: active.peerInfo.id,
        receiverId: currentUserId,
        iceServers,
        onRemoteStream: (stream) => setRemoteStream(stream),
        onConnectionStateChange: handleConnectionStateChange
      });

      callSessionRef.current.addLocalStream(stream);

      signalingService.sendCallResponse({
        callId: active.callId,
        sessionId: active.sessionId,
        callerId: active.peerInfo.id,
        receiverId: currentUserId,
        status: CALL_RESPONSE.ACCEPTED
      });

    } catch (err) {
      toast.error("Failed to access microphone/camera");
      handleEndCall("Media error");
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    const active = activeCallRef.current;
    if (active) {
      signalingService.sendCallResponse({
        callId: active.callId,
        sessionId: active.sessionId,
        callerId: active.peerInfo.id,
        receiverId: currentUserId,
        status: CALL_RESPONSE.REJECTED
      });
      cleanupCall();
    }
  };

  const handleEndCall = (reason = "Ended") => {
    const active = activeCallRef.current;
    if (active) {
      signalingService.sendCallEnd({
        callId: active.callId,
        sessionId: active.sessionId,
        senderId: currentUserId,
        receiverId: active.peerInfo.id,
        reason
      });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    clearTimeout(ringTimeoutRef.current);
    clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = null;
    
    if (callSessionRef.current) {
      callSessionRef.current.close();
      callSessionRef.current = null;
    }
    mediaManager.stopMedia();
    setLocalStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setActiveCall(null);
    setCallState(CALL_STATUS.IDLE);
  };

  const value = {
    callState,
    activeCall,
    localStream,
    remoteStream,
    callDuration,
    startCall,
    acceptCall,
    rejectCall,
    endCall: handleEndCall
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export const useCall = () => useContext(CallContext);
