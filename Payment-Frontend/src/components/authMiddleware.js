import asyncHandler from '../utils/asyncHandler.js';

// demo tokens (swap to real JWT later)
const ADMIN_TOKEN = 'Bearer admin-secret-token';
const USER_TOKEN  = 'Bearer user-secret-token';

const MOCK_ADMIN_USER = { _id: 'admin123', email: 'admin@sathvilla.com', role: 'admin' };
const DEMO_USER  = { _id: 'user456',  email: 'tourist@sathvilla.com', role: 'user' };

// Middleware to protect routes
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  if (token === ADMIN_TOKEN) { req.user = MOCK_ADMIN_USER; return next(); }
  if (token === USER_TOKEN)  { req.user = DEMO_USER;  return next(); }

  return res.status(401).json({ message: 'Not authorized, token invalid' });
});

// Middleware for admin-only routes
export const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Not authorized as admin' });
};