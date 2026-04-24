const { Server }  = require('socket.io');
const jwt         = require('jsonwebtoken');
const prisma      = require('../config/db');
 
function initSockets(server) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });
 
  // ── Auth middleware for WebSocket ────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });
 
  // ── Connection ──────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} user: ${socket.userId}`);
 
    // Join a room
    socket.on('room:join', async ({ roomCode }) => {
      socket.join(roomCode);
      const room = await prisma.room.findUnique({
        where: { code: roomCode },
        include: { players: { include: { user: { select: { username: true } } } } },
      });
      io.to(roomCode).emit('room:updated', room);
    });
 
    // Player progress update
    socket.on('game:progress', async ({ roomCode, percentComplete }) => {
      await prisma.roomPlayer.updateMany({
        where: { userId: socket.userId, room: { code: roomCode } },
        data:  { progress: Math.round(percentComplete) },
      });
      socket.to(roomCode).emit('game:progress', {
        userId: socket.userId,
        percentComplete,
      });
    });
 
    // Player completed the puzzle
    socket.on('game:complete', ({ roomCode, elapsedSecs }) => {
      io.to(roomCode).emit('room:winner', {
        userId: socket.userId,
        elapsedSecs,
      });
    });
 
    // Chat
    socket.on('room:chat', ({ roomCode, message }) => {
      const trimmed = String(message).slice(0, 200);
      io.to(roomCode).emit('room:chat', {
        userId: socket.userId,
        message: trimmed,
        timestamp: Date.now(),
      });
    });
 
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
 
module.exports = { initSockets };
 
