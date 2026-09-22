const Notification = require("../models/Notification");

// GET /api/notifications/my
async function getMyNotifications(req, res) {
    try {
        const notifications = await Notification.find({ recipient: req.user.userId }).sort({
            createdAt: -1,
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch notifications.", error: error.message });
    }
}

// PUT /api/notifications/:id/read
async function markAsRead(req, res) {
    try {
        const notification = await Notification.findByIdAndUpdate(
            { _id: req.params.id, recipient: req.user.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: "Could not update notification.", error: error.message });
    }
}

module.exports = { getMyNotifications, markAsRead };
