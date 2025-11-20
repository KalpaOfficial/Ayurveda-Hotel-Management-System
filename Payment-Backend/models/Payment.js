import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    trim: true,
    lowercase: true,
    // A simple regex for email validation
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address.'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a payment amount.'],
    min: [0.01, 'Amount must be greater than 0.'],
  },
  packageType: {
    type: String,
    required: [true, 'Please select a package type.'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
    default: 'Pending',
  },
  // This will be important when you integrate Stripe/PayPal
  transactionId: {
    type: String,
    // Not required initially, but will be populated after payment
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  // It's good practice to link payments to a user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // This can be made required once you have user authentication
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
