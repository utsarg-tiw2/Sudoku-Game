const authService  = require('../services/auth.service');
const asyncWrapper = require('../utils/asyncWrapper');

console.log("asyncWrapper =", asyncWrapper);
 
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in ms
};
 
const register = asyncWrapper(async (req, res) => {
  const { email, password, username } = req.body;
  const result = await authService.register(email, password, username);
 
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
  res.status(201).json({
    user: result.user,
    accessToken: result.accessToken,
  });
});
 
const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
 
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
  res.json({ user: result.user, accessToken: result.accessToken });
});
 
const refreshToken = asyncWrapper(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
 
  const tokens = await authService.refresh(token);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTS);
  res.json({ accessToken: tokens.accessToken });
});
 
const logout = asyncWrapper(async (req, res) => {
  const token = req.cookies.refreshToken;
  await authService.logout(token);
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});
 
const getMe = asyncWrapper(async (req, res) => {
  res.json({ user: req.user });
});
 
module.exports = { register, login, refreshToken, logout, getMe };
 
