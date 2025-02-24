"use client";

import { io } from "socket.io-client";

export const socket = io(process.env.BACKEND_SERVER || "https://retro-board-backend-ldaq.onrender.com");