import { io } from 'socket.io-client';

const URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '/';
console.log('URL: ', URL);

export const socket = io(URL, { autoConnect: false });