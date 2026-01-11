// lib/socket.js
'use client'; // ensure client-side

import { io } from "socket.io-client";

export const socket = io("https://food-delivery-jubo.onrender.com", {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});
