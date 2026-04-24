const express      = require('express');
const router       = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const asyncWrapper = require('../utils/asyncWrapper');
const roomService  = require('../services/room.service');
 
router.use(authenticate);
 
router.post('/', asyncWrapper(async (req, res) => {
  const room = await roomService.createRoom(req.user.id);
  res.status(201).json(room);
}));
 
router.post('/:code/join', asyncWrapper(async (req, res) => {
  const room = await roomService.joinRoom(req.params.code, req.user.id);
  res.json(room);
}));
 
router.post('/:code/start', asyncWrapper(async (req, res) => {
  const { difficulty = 'MEDIUM' } = req.body;
  const result = await roomService.startRoom(req.params.code, req.user.id, difficulty);
  res.json(result);
}));
 
module.exports = router;
