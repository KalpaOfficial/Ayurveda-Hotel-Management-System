import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/payments  (create; model validates, default status = Pending)
export const createPayment = asyncHandler(async (req, res) => {
  const { name, email, amount, packageType } = req.body;
  const payment = new Payment({ name, email, amount, packageType });
  const saved = await payment.save();
  res.status(201).json(saved);
});

// GET /api/payments (admin list)
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ paymentDate: -1 });
  res.json(payments);
});

// GET /api/payments/user/:email (user list)
export const getPaymentsByUserEmail = asyncHandler(async (req, res) => {
  const reqEmail = String(req.params.email || '').toLowerCase();
  const actor = req.user; // set by protect()
  if (!actor) return res.status(401).json({ message: 'Unauthorized' });

  // user can only access own email; admin can access any
  if (actor.role !== 'admin' && actor.email.toLowerCase() !== reqEmail) {
    return res.status(403).json({ message: 'Forbidden: only your own payments' });
  }
  const items = await Payment.find({ email: reqEmail }).sort({ paymentDate: -1 });
  res.json(items);
});

// PUT /api/payments/:id
export const updatePayment = asyncHandler(async (req, res) => {
  const updated = await Payment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ message: 'Payment not found' });
  res.json(updated);
});

// DELETE /api/payments/:id
export const deletePayment = asyncHandler(async (req, res) => {
  const deleted = await Payment.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Payment not found' });
  res.json({ message: 'Deleted successfully' });
});
