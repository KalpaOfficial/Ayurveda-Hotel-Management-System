const express = require("express");
const router = express.Router();
const NotificationController = require("../Controllers/notificationController");
const NotificationAdmin = require("../Controllers/notificationAdminController");

router.get("/user/:userId", NotificationController.listForUser);
router.post("/", NotificationController.create);
router.put("/:id/read", NotificationController.markRead);

module.exports = router;

// Admin endpoints
router.get("/admin", NotificationAdmin.adminList);
router.put("/admin/:id", NotificationAdmin.adminUpdate);
router.delete("/admin/:id", NotificationAdmin.adminDelete);


