const express = require("express");
const router = express.Router();

const InquiryController = require("../Controllers/inquiryController");

router.get("/", InquiryController.getAllInquiries);
router.get("/test", InquiryController.testConnection);
router.get("/user/:userId", InquiryController.getInquiryByUser);
router.get("/user/:userId/all", InquiryController.getAllInquiriesByUser);
// user-scoped edit/delete (only when pending)
router.put("/user/:userId/:id", InquiryController.updateInquiryByUser);
router.delete("/user/:userId/:id", InquiryController.deleteInquiryByUser);
router.post("/", InquiryController.addInquiry);
router.get("/:id", InquiryController.getInquiryById);
router.put("/:id", InquiryController.updateInquiry);
router.delete("/:id", InquiryController.deleteInquiry);

module.exports = router;
