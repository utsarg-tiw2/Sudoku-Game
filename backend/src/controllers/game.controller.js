const gameService   = require('../services/game.service');
const puzzleService = require('../services/puzzle.service');
const asyncWrapper  = require('../utils/asyncWrapper');
 
const newGame = asyncWrapper(async (req, res) => {
  const { difficulty = 'medium' } = req.query;
  const result = await gameService.createGame(req.user.id, difficulty);
  res.status(201).json(result);
});
 
const getGame = asyncWrapper(async (req, res) => {
  const game = await gameService.resumeGame(req.user.id, req.params.difficulty);
  if (!game) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No active game' } });
  res.json(game);
});
 
const saveMove = asyncWrapper(async (req, res) => {
  const game = await gameService.saveMove(req.params.id, req.user.id, req.body);
  res.json(game);
});
 
const complete = asyncWrapper(async (req, res) => {
  const solved = await puzzleService.checkComplete(req.params.id);
  if (!solved) return res.status(422).json({ error: { code: 'INVALID_MOVE', message: 'Puzzle not correctly solved' } });
  const { elapsedSecs, mistakes } = req.body;
  const game = await gameService.completeGame(req.params.id, req.user.id, elapsedSecs, mistakes);
  res.json(game);
});
 
const history = asyncWrapper(async (req, res) => {
  const { page, limit } = req.query;
  const result = await gameService.getHistory(req.user.id, Number(page)||1, Number(limit)||20);
  res.json(result);
});
 
module.exports = { newGame, getGame, saveMove, complete, history };
 
