import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_HOST;
console.log('URL: ', URL);

export const socket = io(URL, { autoConnect: true });