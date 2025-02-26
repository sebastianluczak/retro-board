'use client';

import { io } from 'socket.io-client';

console.log('Connecting to', process.env.NEXT_PUBLIC_BACKEND_SERVER);
export const socket = io(process.env.NEXT_PUBLIC_BACKEND_SERVER || 'https://retro-board-backend-ldaq.onrender.com');