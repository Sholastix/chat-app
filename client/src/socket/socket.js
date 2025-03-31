import { io } from 'socket.io-client';

const URL = '/';
console.log('URL: ', URL);

export const socket = io(URL, { autoConnect: true });