import signalingService from "./SignalingService";

const optimizeOpusSdp = (sdp) => {
// ... same as before
  const rtpmapRegex = /a=rtpmap:(\d+) opus\/48000\/2/i;
  const match = sdp.match(rtpmapRegex);
  if (!match) return sdp;

  const payloadType = match[1];
  const fmtpRegex = new RegExp(`a=fmtp:${payloadType} (.*)`, 'i');
  
  if (sdp.match(fmtpRegex)) {
    return sdp.replace(fmtpRegex, (fullMatch, params) => {
      let newParams = params;
      if (!newParams.includes('usedtx=1')) newParams += ';usedtx=1';
      if (!newParams.includes('useinbandfec=1')) newParams += ';useinbandfec=1';
      if (!newParams.includes('maxaveragebitrate=128000')) newParams += ';maxaveragebitrate=128000';
      if (!newParams.includes('stereo=0')) newParams += ';stereo=0';
      if (!newParams.includes('cbr=0')) newParams += ';cbr=0';
      return `a=fmtp:${payloadType} ${newParams}`;
    });
  } else {
    return sdp.replace(rtpmapRegex, (fullMatch) => {
      return `${fullMatch}\r\na=fmtp:${payloadType} usedtx=1;useinbandfec=1;maxaveragebitrate=128000;stereo=0;cbr=0`;
    });
  }
};

export default class CallSession {
  constructor({ callId, sessionId, isPolite, callerId, receiverId, iceServers, onRemoteStream, onConnectionStateChange }) {
    this.callId = callId;
    this.sessionId = sessionId;
    this.isPolite = isPolite; // Receiver is polite, Caller is impolite
    this.callerId = callerId;
    this.receiverId = receiverId;
    this.iceServers = iceServers;
    
    this.onRemoteStream = onRemoteStream;
    this.onConnectionStateChange = onConnectionStateChange;
    
    this.peerConnection = null;
    
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.isSettingRemoteAnswerPending = false;
    
    this.iceCandidateQueue = [];

    this._initPeerConnection();
  }

  _initPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceTransportPolicy: "all"
    });

    // 1. Perfect Negotiation: onnegotiationneeded
    this.peerConnection.onnegotiationneeded = async () => {
      try {
        this.makingOffer = true;
        await this.peerConnection.setLocalDescription();
        
        const description = { ...this.peerConnection.localDescription.toJSON() };
        description.sdp = optimizeOpusSdp(description.sdp);
        
        signalingService.sendSdp({
          callId: this.callId,
          sessionId: this.sessionId,
          senderId: this.isPolite ? this.receiverId : this.callerId,
          receiverId: this.isPolite ? this.callerId : this.receiverId,
          description: description
        });
      } catch (err) {
        console.error("Error during negotiation", err);
      } finally {
        this.makingOffer = false;
      }
    };

    // 2. ICE Candidates
    this.peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        // Phase 7 Diagnostics: Log securely (do not log full candidate string if it contains credentials)
        let candidateType = "unknown";
        if (candidate.candidate.includes("typ relay")) candidateType = "relay (TURN)";
        else if (candidate.candidate.includes("typ srflx")) candidateType = "srflx (STUN)";
        else if (candidate.candidate.includes("typ prflx")) candidateType = "prflx (STUN)";
        else if (candidate.candidate.includes("typ host")) candidateType = "host (Local)";
        
        console.log(`[WebRTC] Gathered ICE Candidate: ${candidateType}`);

        signalingService.sendIceCandidate({
          callId: this.callId,
          sessionId: this.sessionId,
          senderId: this.isPolite ? this.receiverId : this.callerId,
          receiverId: this.isPolite ? this.callerId : this.receiverId,
          candidate
        });
      }
    };

    // 3. Track events
    this.peerConnection.ontrack = (event) => {
      if (this.onRemoteStream) {
        if (event.streams && event.streams.length > 0) {
          // Use the native remote stream object
          this.onRemoteStream(event.streams[0]);
        } else {
          // Fallback if browser doesn't populate event.streams natively
          const stream = new MediaStream([event.track]);
          this.onRemoteStream(stream);
        }
      }
    };

    // 4. State Diagnostics & Connection Handlers
    this.peerConnection.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection State: ${this.peerConnection.connectionState}`);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    this.peerConnection.onicegatheringstatechange = () => {
      console.log(`[WebRTC] ICE Gathering State: ${this.peerConnection.iceGatheringState}`);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE Connection State: ${this.peerConnection.iceConnectionState}`);
    };

    this.peerConnection.onsignalingstatechange = () => {
      console.log(`[WebRTC] Signaling State: ${this.peerConnection.signalingState}`);
    };
  }

  // Handle incoming SDP
  async handleSdp(description) {
    if (!this.peerConnection) return;
    try {
      const offerCollision = (description.type === "offer") &&
        (this.makingOffer || this.peerConnection.signalingState !== "stable");

      this.ignoreOffer = !this.isPolite && offerCollision;
      if (this.ignoreOffer) {
        return;
      }

      this.isSettingRemoteAnswerPending = description.type === "answer";
      await this.peerConnection.setRemoteDescription(description);
      this.isSettingRemoteAnswerPending = false;

      // Flush queued candidates
      this._flushIceCandidates();

      if (description.type === "offer") {
        await this.peerConnection.setLocalDescription();
        
        const localDesc = { ...this.peerConnection.localDescription.toJSON() };
        localDesc.sdp = optimizeOpusSdp(localDesc.sdp);
        
        signalingService.sendSdp({
          callId: this.callId,
          sessionId: this.sessionId,
          senderId: this.isPolite ? this.receiverId : this.callerId,
          receiverId: this.isPolite ? this.callerId : this.receiverId,
          description: localDesc
        });
      }
    } catch (err) {
      console.error("Error handling SDP", err);
    }
  }

  // Handle incoming ICE
  async handleIceCandidate(candidate) {
    if (!this.peerConnection) return;
    try {
      if (this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type) {
        await this.peerConnection.addIceCandidate(candidate);
      } else {
        this.iceCandidateQueue.push(candidate);
      }
    } catch (err) {
      if (!this.ignoreOffer) {
        console.error("Error adding ice candidate", err);
      }
    }
  }

  async _flushIceCandidates() {
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      try {
        await this.peerConnection.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error flushing ice candidate", err);
      }
    }
  }

  addLocalStream(stream) {
    if (!this.peerConnection || !stream) return;
    stream.getTracks().forEach(track => {
      // Add track handles duplicates internally if properly checked, 
      // but WebRTC creates transceivers, so it's safe to just add them once at startup.
      this.peerConnection.addTrack(track, stream);
    });
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
