const prisma    = require('../config/db');
const { redis } = require('../config/redis');
 
const CACHE_TTL = 60; // seconds
 
function cacheKey(difficulty, period) {
  return `leaderboard:${difficulty}:${period}`;
}
 
async function getTopScores(difficulty = 'MEDIUM', period = 'alltime', limit = 100) {
  const key    = cacheKey(difficulty, period);
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
 
  const where = { difficulty: difficulty.toUpperCase() };
  if (period === 'weekly') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: weekAgo };
  }
 
  const scores = await prisma.score.findMany({
    where,
    orderBy: [{ elapsedSecs: 'asc' }, { mistakes: 'asc' }],
    take: limit,
    include: { user: { select: { username: true, avatarUrl: true } } },
  });
 
  await redis.setEx(key, CACHE_TTL, JSON.stringify(scores));
  return scores;
}
 
async function getUserRank(userId, difficulty = 'MEDIUM', period = 'alltime') {
  const scores = await getTopScores(difficulty, period, 10000);
  const rank   = scores.findIndex(s => s.userId === userId) + 1;
  return rank > 0 ? rank : null;
}
 
async function invalidateCache(difficulty) {
  await redis.del(cacheKey(difficulty, 'alltime'));
  await redis.del(cacheKey(difficulty, 'weekly'));
}
 
module.exports = { getTopScores, getUserRank, invalidateCache };
 
