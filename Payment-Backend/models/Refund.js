import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 }, // USD
    reason: {
      type: String,
      enum: ['Accidental payment', 'Service issue', 'Duplicate charge', 'Other'],
      required: true,
    },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Requested', 'Processing', 'Approved', 'Denied', 'Refunded', 'Failed'],
      default: 'Requested',
    },
    policyWindowDays: { type: Number, default: 30 }, // e.g., 30 days window
    stripeRefundId: { type: String },
    decisionBy: { type: String }, // admin email or id
    decisionAt: { type: Date },
  },
  { timestamps: true }
);

const Refund = mongoose.model('Refund', refundSchema);
export default Refund;
