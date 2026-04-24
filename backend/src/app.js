require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const http         = require('http');

const { connectRedis } = require('./config/redis');
const prisma           = require('./config/db');
const errorHandler     = require('./middlewares/error.middleware');
const { initSockets }  = require('./sockets');

// ── Route imports ────────────────────────────────────────────────────────────
let authRoutes, puzzleRoutes, gameRoutes, leaderboardRoutes, roomRoutes;

try { authRoutes        = require('./routes/auth.routes');        console.log('✅ auth.routes loaded'); }
catch(e) { console.error('❌ auth.routes FAILED:', e.message); process.exit(1); }

try { puzzleRoutes      = require('./routes/puzzle.routes');      console.log('✅ puzzle.routes loaded'); }
catch(e) { console.error('❌ puzzle.routes FAILED:', e.message); process.exit(1); }

try { gameRoutes        = require('./routes/game.routes');        console.log('✅ game.routes loaded'); }
catch(e) { console.error('❌ game.routes FAILED:', e.message); process.exit(1); }

try { leaderboardRoutes = require('./routes/leaderboard.routes'); console.log('✅ leaderboard.routes loaded'); }
catch(e) { console.error('❌ leaderboard.routes FAILED:', e.message); process.exit(1); }

try { roomRoutes        = require('./routes/room.routes');        console.log('✅ room.routes loaded'); }
catch(e) { console.error('❌ room.routes FAILED:', e.message); process.exit(1); }

// Verify all routes are valid Express routers
const routeMap = { authRoutes, puzzleRoutes, gameRoutes, leaderboardRoutes, roomRoutes };
for (const [name, router] of Object.entries(routeMap)) {
  if (typeof router !== 'function') {
    console.error(`❌ ${name} is not a function — it's: ${typeof router} →`, router);
    console.error(`   Fix: open the route file and make sure it ends with: module.exports = router;`);
    process.exit(1);
  }
}
console.log('✅ All routes verified OK');

// ── App setup ────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/puzzles',     puzzleRoutes);
app.use('/api/games',       gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rooms',       roomRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

async function start() {
  await connectRedis();
  initSockets(server);
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);

module.exports = app;