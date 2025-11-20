import Refund from '../models/Refund.js';
import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

// Helper: policy check
const withinPolicy = (paymentDate, windowDays = 30) => {
  if (!paymentDate) return false;
  const d1 = new Date(paymentDate).getTime();
  const d2 = Date.now();
  const diffDays = (d2 - d1) / (1000 * 60 * 60 * 24);
  return diffDays <= windowDays;
};

// POST /api/refunds  (user)  body: { paymentId, amount?, reason, note }
export const requestRefund = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) return res.status(401).json({ message: 'Unauthorized' });

  const { paymentId, amount, reason, note } = req.body || {};
  if (!paymentId || !reason) return res.status(400).json({ message: 'paymentId and reason are required' });

  const p = await Payment.findById(paymentId);
  if (!p) return res.status(404).json({ message: 'Payment not found' });

  // user can only request for own payment unless admin
  if (actor.role !== 'admin' && actor.email.toLowerCase() !== p.email.toLowerCase()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (p.status !== 'Paid') return res.status(400).json({ message: 'Only paid transactions can be refunded' });

  const policyDays = 30;
  if (!withinPolicy(p.paymentDate, policyDays)) {
    return res.status(400).json({ message: `Refund window expired (>${policyDays} days)` });
  }

  // avoid duplicate open requests for same payment
  const openReq = await Refund.findOne({ paymentId: p._id, status: { $in: ['Requested', 'Processing', 'Approved'] } });
  if (openReq) return res.status(409).json({ message: 'A refund request already exists for this payment' });

  const refundAmount = Number(amount || p.amount);
  if (refundAmount <= 0 || refundAmount > p.amount) {
    return res.status(400).json({ message: 'Invalid refund amount' });
  }

  const created = await Refund.create({
    paymentId: p._id,
    userEmail: p.email,
    amount: refundAmount,
    reason,
    note,
    policyWindowDays: policyDays,
    status: 'Requested',
  });

  res.status(201).json(created);
});

// GET /api/refunds/mine (user)
export const getMyRefunds = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) return res.status(401).json({ message: 'Unauthorized' });
  const items = await Refund.find({ userEmail: actor.email.toLowerCase() })
    .sort({ createdAt: -1 })
    .populate('paymentId');
  res.json(items);
});

// GET /api/refunds (admin, optional ?status=Requested)
export const getAllRefunds = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const q = status ? { status } : {};
  const items = await Refund.find(q).sort({ createdAt: -1 }).populate('paymentId');
  res.json(items);
});

// PATCH /api/refunds/:id (admin) body: { action: 'approve'|'deny', amount? }
export const decideRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, amount } = req.body || {};
  const actor = req.user;

  const r = await Refund.findById(id).populate('paymentId');
  if (!r) return res.status(404).json({ message: 'Refund not found' });
  if (!r.paymentId) return res.status(400).json({ message: 'Refund missing payment' });

  if (r.status !== 'Requested') return res.status(400).json({ message: `Cannot ${action}; current status=${r.status}` });

  if (action === 'deny') {
    r.status = 'Denied';
    r.decisionBy = actor?.email || 'admin';
    r.decisionAt = new Date();
    await r.save();
    return res.json(r);
  }

  if (action === 'approve') {
    // validate amount
    const refundAmount = Number(amount || r.amount);
    if (refundAmount <= 0 || refundAmount > r.paymentId.amount) {
      return res.status(400).json({ message: 'Invalid refund amount' });
    }
    if (!r.paymentId.transactionId) {
      return res.status(400).json({ message: 'Payment is missing transactionId (PaymentIntent)' });
    }

    // mark processing
    r.status = 'Processing';
    await r.save();

    try {
      // Stripe refund (amount in cents). Use idempotency with refund id + amount.
      const idempotencyKey = `refund_${r._id}_${refundAmount}`;
      const refund = await stripe.refunds.create(
        {
          payment_intent: r.paymentId.transactionId,
          amount: Math.round(refundAmount * 100),
          metadata: {
            refundId: r._id.toString(),
            paymentId: r.paymentId._id.toString(),
            approvedBy: actor?.email || 'admin',
          },
        },
        { idempotencyKey }
      );

      r.status = refund.status === 'succeeded' ? 'Refunded' : 'Approved'; // fallback if async
      r.stripeRefundId = refund.id;
      r.decisionBy = actor?.email || 'admin';
      r.decisionAt = new Date();
      await r.save();

      // Optional: update Payment status if full refund
      if (refundAmount >= r.paymentId.amount) {
        await Payment.findByIdAndUpdate(r.paymentId._id, { status: 'Refunded' });
      }

      return res.json(r);
    } catch (e) {
      console.error('Stripe refund error:', e);
      r.status = 'Failed';
      await r.save();
      return res.status(502).json({ message: 'Stripe refund failed' });
    }
  }

  return res.status(400).json({ message: 'Unknown action' });
});
