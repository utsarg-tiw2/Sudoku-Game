const prisma   = require('../config/db');
const AppError = require('../utils/AppError');
const { generateFullBoard, makePuzzle } = require('../utils/sudoku');
 
function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
 
async function createRoom(hostId) {
  const code = makeCode();
  return prisma.room.create({
    data: { code, hostId },
    include: { players: { include: { user: { select: { username: true } } } } },
  });
}
 
async function joinRoom(code, userId) {
  const room = await prisma.room.findUnique({
    where: { code },
    include: { players: true },
  });
  if (!room)                     throw new AppError('Room not found', 404, 'NOT_FOUND');
  if (room.status !== 'WAITING') throw new AppError('Game already started', 400, 'BAD_REQUEST');
  if (room.players.length >= 4)  throw new AppError('Room is full', 400, 'BAD_REQUEST');
 
  await prisma.roomPlayer.upsert({
    where: { roomId_userId: { roomId: room.id, userId } },
    update: {},
    create: { roomId: room.id, userId },
  });
 
  return prisma.room.findUnique({
    where: { id: room.id },
    include: { players: { include: { user: { select: { username: true } } } } },
  });
}
 
async function startRoom(code, hostId, difficulty = 'MEDIUM') {
  const room = await prisma.room.findUnique({ where: { code } });
  if (!room)                throw new AppError('Room not found', 404, 'NOT_FOUND');
  if (room.hostId !== hostId) throw new AppError('Only host can start', 403, 'FORBIDDEN');
 
  const solution = generateFullBoard();
  const givens   = makePuzzle(solution, difficulty);
 
  const puzzle = await prisma.puzzle.create({
    data: { difficulty, givens, solution },
  });
 
  await prisma.room.update({
    where: { id: room.id },
    data:  { status: 'PLAYING', puzzleId: puzzle.id },
  });
 
  return { puzzle, givens };
}
 
module.exports = { createRoom, joinRoom, startRoom };
 
