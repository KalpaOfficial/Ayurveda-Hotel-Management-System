const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define booking schema
const bookingSchema = new Schema({
  b_name: {
    type: String,
    required: true,
  },
  b_email: {
    type: String,
    required: false,
  },
  b_phone: {
    type: String,
    required: true,
  },
  b_packageType: {
    type: String,
    enum: ['7 Days Rejuvenation', '14 Days Wellness', '21 Days Detox & Healing', 'Weekend Refresh (3 Days)', 'Senior Wellness (10 Days)'],
    required: true,
  },
  b_packageDuration: {
    type: Number,
    required: true,
  },
  b_checkInDate: {
    type: Date,
    required: true,
  },
  b_checkOutDate: {
    type: Date,
    required: true,
  },
  b_guest: {
    type: Number,
    default: 1,
    required: true,
  },
  b_roomNumber: {
    type: Number,
    required: true,
  },
  b_discount: {
    type: Number,
    default: 0,
  },
  b_packagePrice: {
    type: Number,
    required: true,
  },
  b_totalPrice: {
    type: Number,
    required: true,
  },
  b_paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  b_createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Export model
module.exports = mongoose.model("bookingModel", bookingSchema);
