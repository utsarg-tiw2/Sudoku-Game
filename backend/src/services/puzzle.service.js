const prisma   = require('../config/db');
const AppError = require('../utils/AppError');
const { generateFullBoard, makePuzzle, isSolved } = require('../utils/sudoku');
 
async function createPuzzle(difficulty) {
  const solution = generateFullBoard();
  const givens   = makePuzzle(solution, difficulty.toUpperCase());
 
  const puzzle = await prisma.puzzle.create({
    data: {
      difficulty: difficulty.toUpperCase(),
      givens,
      solution,
    },
  });
  return puzzle;
}
 
async function validateMove(puzzleId, row, col, value) {
  const puzzle = await prisma.puzzle.findUnique({ where: { id: puzzleId } });
  if (!puzzle) throw new AppError('Puzzle not found', 404, 'NOT_FOUND');
  const correct = puzzle.solution[row][col];
  return { correct: correct === value, expected: correct };
}
 
async function checkComplete(gameId) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { puzzle: true },
  });
  if (!game) throw new AppError('Game not found', 404, 'NOT_FOUND');
  return isSolved(game.boardState, game.puzzle.solution);
}
 
module.exports = { createPuzzle, validateMove, checkComplete };
 
