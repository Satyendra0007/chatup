const express = require("express");
const { requireAuth } = require('@clerk/express');
const router = express.Router();

router.get("/config", requireAuth(), (req, res) => {
  // Read config from .env or fallback to Google STUN
  const username = process.env.TURN_USERNAME || "";
  const credential = process.env.TURN_PASSWORD || "";
  
  const stunUrl = process.env.STUN_SERVER || "stun:stun.l.google.com:19302";
  const turnUdp = process.env.TURN_SERVER_UDP;
  const turnTcp = process.env.TURN_SERVER_TCP;
  const turnTls = process.env.TURN_SERVER_TLS;

  const iceServers = [
    { urls: stunUrl }
  ];

  if (username && credential) {
    if (turnUdp) iceServers.push({ urls: turnUdp, username, credential });
    if (turnTcp) iceServers.push({ urls: turnTcp, username, credential });
    if (turnTls) iceServers.push({ urls: turnTls, username, credential });
  }

  res.status(200).json({ iceServers });
});

module.exports = router;
