const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // null/undefined means broadcast
  type: { type: String, required: true }, // e.g., 'inquiry_responded', 'product_new', 'custom'
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }, // used for user-specific notifications
  readBy: { type: [String], default: [] }, // for broadcast notifications, track who read
  visible: { type: Boolean, default: true }, // hide/show for customers
  metadata: { type: Object, required: false },
  createdAt: { type: Date, default: Date.now }
});

// Index to quickly get user + broadcast notifications
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("notificationModel", notificationSchema);


