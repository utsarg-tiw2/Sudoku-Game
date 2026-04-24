import { io } from 'socket.io-client';
 
let socket = null;
 
export function connectSocket() {
  const token = localStorage.getItem('accessToken');
  socket = io('http://localhost:4000', {
    auth: { token },
    autoConnect: true,
  });
  return socket;
}
 
export function getSocket() {
  return socket;
}
 
export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
 
