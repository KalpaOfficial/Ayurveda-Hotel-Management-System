import mongoose from 'mongoose';

const checkoutContextSchema = new mongoose.Schema({
  token: { type: String, unique: true, required: true },
  type: { type: String, enum: ['booking', 'cart'], default: 'booking' },
  name: String,
  email: String,
  amount: Number,
  packageType: String,
  bookingData: mongoose.Schema.Types.Mixed, // legacy
  cart: [{
    _id: String,
    p_name: String,
    quantity: Number,
    p_price: Number // LKR
  }],
  status: { type: String, default: 'Init' },
}, { timestamps: true });

export default mongoose.model('CheckoutContext', checkoutContextSchema);