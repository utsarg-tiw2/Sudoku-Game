const { createClient } = require('redis');
 
const redis = createClient({ url: process.env.REDIS_URL });
 
redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('Redis connected'));
 
// Call this once at app startup
async function connectRedis() {
  await redis.connect();
}
 
module.exports = { redis, connectRedis };
 
