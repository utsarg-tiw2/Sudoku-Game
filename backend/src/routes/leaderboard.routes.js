const express  = require('express');
const router   = express.Router();
const lb       = require('../services/leaderboard.service');
const asyncWrapper = require('../utils/asyncWrapper');
 
router.get('/', asyncWrapper(async (req, res) => {
  const { difficulty = 'MEDIUM', period = 'alltime' } = req.query;
  const scores = await lb.getTopScores(difficulty, period);
  res.json({ scores });
}));
 
module.exports = router;
 
