const Notification = require("../Model/notificationModel");

const listForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const raw = await Notification.find({ $or: [ { userId }, { userId: null }, { userId: undefined } ], visible: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const notifications = raw.map(n => ({
      ...n,
      // a broadcast (no userId) is unread if current userId not in readBy
      read: n.userId ? n.read : (Array.isArray(n.readBy) && n.readBy.includes(userId))
    }));
    return res.status(200).json({ notifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load notifications" });
  }
};

const create = async (req, res) => {
  const { userId, type, title, message, metadata } = req.body;
  try {
    const n = new Notification({ userId: userId || null, type, title, message, metadata });
    await n.save();
    return res.status(201).json({ notification: n });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create notification" });
  }
};

const markRead = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const n = await Notification.findById(id);
    if (!n) return res.status(404).json({ message: "Notification not found" });
    if (n.userId) {
      // user-targeted, set read flag
      n.read = true;
    } else {
      // broadcast: add user to readBy
      if (!Array.isArray(n.readBy)) n.readBy = [];
      if (userId && !n.readBy.includes(userId)) n.readBy.push(userId);
    }
    await n.save();
    return res.status(200).json({ notification: n });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to mark as read" });
  }
};

module.exports = { listForUser, create, markRead };


