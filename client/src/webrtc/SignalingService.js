import socket from "../utils/socket";

class SignalingService {
  constructor() {
    this.socket = socket;
    this.handlers = new Map();
  }

  // Bind a generic event listener (prevents duplicate bindings)
  on(event, handler) {
    this.off(event);
    this.handlers.set(event, handler);
    this.socket.on(event, handler);
  }

  off(event) {
    const handler = this.handlers.get(event);
    if (handler) {
      this.socket.off(event, handler);
      this.handlers.delete(event);
    }
  }

  offAll() {
    for (const event of this.handlers.keys()) {
      this.off(event);
    }
  }

  _buildPayload(base) {
    return {
      ...base,
      messageId: crypto.randomUUID(),
      timestamp: Date.now(),
    };
  }

  sendCallRequest(payload) {
    this.socket.emit("call-request", this._buildPayload(payload));
  }

  sendCallResponse(payload) {
    this.socket.emit("call-response", this._buildPayload(payload));
  }

  sendSdp(payload) {
    this.socket.emit("call-sdp", this._buildPayload(payload));
  }

  sendIceCandidate(payload) {
    this.socket.emit("call-ice", this._buildPayload(payload));
  }

  sendCallEnd(payload) {
    this.socket.emit("call-end", this._buildPayload(payload));
  }
}

const signalingService = new SignalingService();
export default signalingService;
