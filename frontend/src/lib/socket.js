// lib/socket.js
'use client'; // ensure client-side

import { io } from "socket.io-client";

export const socket = io("http://localhost:8002", {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});
