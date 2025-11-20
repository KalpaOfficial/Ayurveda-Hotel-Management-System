const express = require("express");
const router = express.Router();

const ReviewController = require("../Controllers/reviewController");

router.get("/", ReviewController.getAllReviews);
router.get("/product/:productId", ReviewController.getReviewsByProduct);
router.get("/top/five-star/latest", ReviewController.getLatestTopFiveStarReviews);
router.post("/", ReviewController.addReview);
router.get("/:id", ReviewController.getReviewById);
router.put("/:id", ReviewController.updateReview);
router.delete("/:id", ReviewController.deleteReview);

module.exports = router;
