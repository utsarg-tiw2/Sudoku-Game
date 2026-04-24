const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');
 
// ── Generate both tokens ───────────────────────────
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN }
  );
  return { accessToken, refreshToken };
}
 
// ── Register ────────────────────────────────────────
async function register(email, password, username) {
  // Check email not already taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409, 'CONFLICT');
 
  // Check username not taken
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) throw new AppError('Username taken', 409, 'CONFLICT');
 
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);
 
  // Create user
  const user = await prisma.user.create({
    data: { email, passwordHash, username },
  });
 
  const tokens = generateTokens(user.id);
 
  // Store refresh token in DB
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt },
  });
 
  return { user: { id: user.id, email: user.email, username: user.username }, ...tokens };
}
 
// ── Login ───────────────────────────────────────────
async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash)
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
 
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
 
  const tokens = generateTokens(user.id);
 
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt },
  });
 
  return { user: { id: user.id, email: user.email, username: user.username }, ...tokens };
}
 
// ── Refresh ─────────────────────────────────────────
async function refresh(token) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
  }
 
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date())
    throw new AppError('Refresh token expired', 401, 'UNAUTHORIZED');
 
  // Rotate — delete old, issue new
  await prisma.refreshToken.delete({ where: { token } });
  const tokens = generateTokens(payload.userId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: payload.userId, expiresAt },
  });
  return tokens;
}
 
// ── Logout ──────────────────────────────────────────
async function logout(refreshToken) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}
 
module.exports = { register, login, refresh, logout, generateTokens };
 
