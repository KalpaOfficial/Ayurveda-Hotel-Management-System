const Review = require("../Model/reviewModel");
const User = require("../Model/userModel");

// Get all reviews (enriched with user details)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find();
        const userIds = reviews.map(r => r.userId).filter(Boolean);
        const users = await User.find({ _id: { $in: userIds } });
        const userMap = new Map(users.map(u => [String(u._id), u]));

        const enriched = reviews.map(r => {
            const u = userMap.get(String(r.userId));
            return {
                _id: r._id,
                review_id: r.review_id,
                productId: r.productId,
                description: r.description,
                stars: r.stars,
                createdAt: r.createdAt,
                userId: r.userId,
                user: u ? {
                    id: u._id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    country: u.country,
                    profilePicture: u.profilePicture
                } : null
            };
        });

        return res.status(200).json({ reviews: enriched || [] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get reviews by product ID (enriched with user details)
const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId: productId });
        const userIds = reviews.map(r => r.userId).filter(Boolean);
        const users = await User.find({ _id: { $in: userIds } });
        const userMap = new Map(users.map(u => [String(u._id), u]));

        const enriched = reviews.map(r => {
            const u = userMap.get(String(r.userId));
            return {
                _id: r._id,
                review_id: r.review_id,
                productId: r.productId,
                description: r.description,
                stars: r.stars,
                createdAt: r.createdAt,
                userId: r.userId,
                user: u ? {
                    id: u._id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    country: u.country,
                    profilePicture: u.profilePicture
                } : null
            };
        });

        return res.status(200).json({ reviews: enriched || [] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Add new review (one per user)
const addReview = async (req, res) => {
    const { name, description, stars, productId, userId } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: "Login required" });
        }

        // Enforce one review per user
        const existing = await Review.findOne({ userId });
        if (existing) {
            return res.status(400).json({ message: "User has already submitted a review" });
        }

        const review = new Review({ name, description, stars, productId, userId });
        await review.save();
        return res.status(201).json({ review });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: err.message || "Validation error",
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        return res.status(500).json({ message: "Unable to add review" });
    }
};

// Get review by ID (Mongo _id)
const getReviewById = async (req, res) => {
    const id = req.params.id;
    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        return res.status(200).json({ review });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update review (owner only)
const updateReview = async (req, res) => {
    const id = req.params.id;
    const { name, description, stars, userId } = req.body;
    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (!userId || review.userId !== userId) {
            return res.status(403).json({ message: "Not allowed to edit this review" });
        }
        review.name = name;
        review.description = description;
        review.stars = stars;

        await review.save();
        return res.status(200).json({ review });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: err.message || "Validation error",
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        return res.status(500).json({ message: "Update failed" });
    }
};

// Delete review (owner only)
const deleteReview = async (req, res) => {
    const id = req.params.id;
    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Unable to delete review" });
        }
        const { userId } = req.body || {};
        if (!userId || review.userId !== userId) {
            return res.status(403).json({ message: "Not allowed to delete this review" });
        }

        await Review.findByIdAndDelete(id);
        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Latest 3 five-star reviews with user details
const getLatestTopFiveStarReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ stars: 5 }).sort({ createdAt: -1 }).limit(3);
        const userIds = reviews.map(r => r.userId).filter(Boolean);
        const users = await User.find({ _id: { $in: userIds } });
        const userMap = new Map(users.map(u => [String(u._id), u]));

        const enriched = reviews.map(r => {
            const u = userMap.get(String(r.userId));
            return {
                _id: r._id,
                review_id: r.review_id,
                description: r.description,
                stars: r.stars,
                createdAt: r.createdAt,
                user: u ? {
                    id: u._id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    country: u.country,
                    profilePicture: u.profilePicture
                } : null
            };
        });

        return res.status(200).json({ reviews: enriched });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllReviews,
    getReviewsByProduct,
    addReview,
    getReviewById,
    updateReview,
    deleteReview,
    getLatestTopFiveStarReviews,
};
