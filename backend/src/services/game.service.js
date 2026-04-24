const prisma          = require('../config/db');
const AppError        = require('../utils/AppError');
const puzzleService   = require('./puzzle.service');
 
async function createGame(userId, difficulty) {
  // Abandon any existing active game for this difficulty
  await prisma.game.updateMany({
    where: { userId, difficulty: difficulty.toUpperCase(), status: 'ACTIVE' },
    data:  { status: 'ABANDONED' },
  });
 
  const puzzle = await puzzleService.createPuzzle(difficulty);
 
  const game = await prisma.game.create({
    data: {
      userId,
      puzzleId:   puzzle.id,
      difficulty: puzzle.difficulty,
      boardState: puzzle.givens,
      notesState: {},
    },
  });
  return { game, puzzle };
}
 
async function saveMove(gameId, userId, { boardState, notesState, elapsedSecs, mistakes }) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game)              throw new AppError('Game not found', 404, 'NOT_FOUND');
  if (game.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (game.status !== 'ACTIVE') throw new AppError('Game is not active', 400, 'BAD_REQUEST');
 
  return prisma.game.update({
    where: { id: gameId },
    data:  { boardState, notesState, elapsedSecs, mistakes },
  });
}
 
async function completeGame(gameId, userId, elapsedSecs, mistakes) {
  const game = await prisma.game.update({
    where: { id: gameId },
    data:  { status: 'COMPLETED', elapsedSecs, mistakes, completedAt: new Date() },
  });
 
  // Submit to leaderboard
  await prisma.score.create({
    data: { userId, gameId, difficulty: game.difficulty, elapsedSecs, mistakes },
  });
 
  return game;
}
 
async function resumeGame(userId, difficulty) {
  return prisma.game.findFirst({
    where:   { userId, difficulty: difficulty.toUpperCase(), status: 'ACTIVE' },
    include: { puzzle: { select: { givens: true, solution: true } } },
    orderBy: { updatedAt: 'desc' },
  });
}
 
async function getHistory(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where:   { userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      skip, take: limit,
      select: { id: true, difficulty: true, elapsedSecs: true, mistakes: true, completedAt: true },
    }),
    prisma.game.count({ where: { userId, status: 'COMPLETED' } }),
  ]);
  return { games, total, page, totalPages: Math.ceil(total / limit) };
}
 
module.exports = { createGame, saveMove, completeGame, resumeGame, getHistory };
 
