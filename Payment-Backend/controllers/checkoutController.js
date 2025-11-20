import crypto from 'crypto';
import CheckoutContext from '../models/CheckoutContext.js';

export const initCheckout = async (req, res) => {
  try {
    const { name, email, amount, packageType, bookingData } = req.body;
    if (!name || !email || !amount || !packageType || !bookingData) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const token = crypto.randomBytes(16).toString('hex');

    await CheckoutContext.create({
      token,
      name,
      email: email.toLowerCase(),
      amount: Number(amount),
      packageType,
      bookingData,
      status: 'Init',
    });

    return res.json({
      token,
      redirectUrl: `${process.env.FRONTEND_URL}/pay?t=${token}`,
    });
  } catch (e) {
    console.error('initCheckout error:', e);
    return res.status(500).json({ message: 'Failed to init checkout' });
  }
};

export const getContext = async (req, res) => {
  try {
    const { token } = req.params;
    const ctx = await CheckoutContext.findOne({ token });
    if (!ctx) return res.status(404).json({ message: 'Context not found' });

    // Return only needed fields
    return res.json({
      token: ctx.token,
      name: ctx.name,
      email: ctx.email,
      amount: ctx.amount,
      packageType: ctx.packageType,
      status: ctx.status,
    });
  } catch (e) {
    console.error('getContext error:', e);
    return res.status(500).json({ message: 'Failed to fetch context' });
  }
};
