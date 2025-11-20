const Notification = require("../Model/notificationModel");

const adminList = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(200);
    res.status(200).json({ notifications });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load notifications' });
  }
};

const adminUpdate = async (req, res) => {
  const { id } = req.params;
  const { title, message, visible } = req.body;
  try {
    const n = await Notification.findById(id);
    if (!n) return res.status(404).json({ message: 'Not found' });
    if (title !== undefined) n.title = title;
    if (message !== undefined) n.message = message;
    if (visible !== undefined) n.visible = visible;
    await n.save();
    res.status(200).json({ notification: n });
  } catch (e) {
    res.status(500).json({ message: 'Update failed' });
  }
};

const adminDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const n = await Notification.findByIdAndDelete(id);
    if (!n) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

module.exports = { adminList, adminUpdate, adminDelete };


