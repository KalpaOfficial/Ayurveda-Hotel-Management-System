const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inquirySchema = new Schema({
    inquiry_id: {
        type: String,
        unique: true
    },
    userId: {
        type: String,
        required: false
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
    email: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    phone: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: ['general', 'booking', 'product', 'complaint', 'feedback', 'support'],
        default: 'general'
    },
    description: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['pending', 'responded', 'closed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    response: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

inquirySchema.pre('save', async function(next) {
    try {
        if (!this.inquiry_id) {
            // Generate a unique inquiry_id
            let inquiryId;
            let attempts = 0;
            const maxAttempts = 10;
            
            do {
                const lastInquiry = await this.constructor.findOne({}, {}, { sort: { 'inquiry_id': -1 } });
                
                if (lastInquiry && lastInquiry.inquiry_id) {
                    const lastNumber = parseInt(lastInquiry.inquiry_id.slice(3));
                    inquiryId = `INQ${String(lastNumber + 1 + attempts).padStart(3, '0')}`;
                } else {
                    inquiryId = `INQ${String(1 + attempts).padStart(3, '0')}`;
                }
                
                // Check if this ID already exists
                const existing = await this.constructor.findOne({ inquiry_id: inquiryId });
                if (!existing) {
                    break;
                }
                
                attempts++;
            } while (attempts < maxAttempts);
            
            if (attempts >= maxAttempts) {
                // Fallback to timestamp-based ID
                inquiryId = `INQ${Date.now().toString().slice(-6)}`;
            }
            
            this.inquiry_id = inquiryId;
        }
        
        // Update the updatedAt field
        this.updatedAt = new Date();
        next();
    } catch (error) {
        console.error("Error in pre-save hook:", error);
        next(error);
    }
});

module.exports = mongoose.model("inquiryModel", inquirySchema);
