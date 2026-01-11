// lib/socket.js
import { io } from "socket.io-client";

let socket = null;

if (typeof window !== "undefined") {
  socket = io("https://food-delivery-jubo.onrender.com", {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
  });
}

export { socket };
