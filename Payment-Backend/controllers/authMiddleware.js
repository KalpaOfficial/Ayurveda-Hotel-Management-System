// Payment/backend/controllers/authMiddleware.js
import asyncHandler from '../utils/asyncHandler.js';

const ADMIN_TOKEN = 'Bearer admin-secret-token';
const USER_TOKEN  = 'Bearer user-secret-token';

const MOCK_ADMIN_USER = { _id: 'admin123', email: 'admin@sathvilla.com', role: 'admin' };
const DEMO_USER       = { _id: 'user456',  email: 'tourist@sathvilla.com', role: 'user' };

export const protect = asyncHandler(async (req, res, next) => {
  const headerToken = req.headers.authorization; // 'Bearer user-secret-token'
  const queryToken  = req.query.token ? `Bearer ${req.query.token}` : null;
  const token = headerToken || queryToken;

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  if (token === ADMIN_TOKEN) {
    req.user = MOCK_ADMIN_USER;
    return next();
  }

  if (token === USER_TOKEN) {
    // 👇 adopt the email from query (?email=...) for demo
    const effectiveEmail = (req.query.email || DEMO_USER.email).toLowerCase();
    req.user = { ...DEMO_USER, email: effectiveEmail };
    return next();
  }

  return res.status(401).json({ message: 'Not authorized, token failed' });
});

export const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Not authorized as admin' });
};