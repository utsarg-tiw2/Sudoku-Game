const jwt     = require('jsonwebtoken');
const prisma  = require('../config/db');
 
// Attach this to any route that requires login
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
 
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
 
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, username: true, avatarUrl: true },
    });
    if (!user)
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found' } });
 
    req.user = user;   // now available in all controllers as req.user
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}
 
module.exports = authenticate;
 
