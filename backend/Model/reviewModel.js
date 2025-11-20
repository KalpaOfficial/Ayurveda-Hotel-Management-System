const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    review_id: {
        type: String,
        unique: true
    },
    productId: {
        type: String,
        required: false,
        ref: 'productModel'
    },
    userId: {
        type: String,
        required: true,
        ref: 'userModel',
        unique: true // one review per user
    },
    name: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                return !v || /^[a-zA-Z\s]+$/.test(v); // Only letters and spaces allowed
            },
            message: 'Name can only contain letters and spaces'
        }
    },
    description: {
        type: String,
        required: false,
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

reviewSchema.pre('save', async function(next) {
    if (!this.review_id) {
        const lastReview = await this.constructor.findOne({}, {}, { sort: { 'review_id': -1 } });
        
        if (lastReview && lastReview.review_id) {
            const lastNumber = parseInt(lastReview.review_id.slice(3));
            this.review_id = `REV${String(lastNumber + 1).padStart(3, '0')}`;
        } else {
            this.review_id = 'REV001';
        }
    }
    next();
});

module.exports = mongoose.model("reviewModel", reviewSchema);
