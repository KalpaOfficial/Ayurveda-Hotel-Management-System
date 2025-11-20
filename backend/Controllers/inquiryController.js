const Inquiry = require("../Model/inquiryModel");

// Get all inquiries
const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find();
        return res.status(200).json({ inquiries: inquiries || [] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Test endpoint to check database connection
const testConnection = async (req, res) => {
    try {
        const count = await Inquiry.countDocuments();
        return res.status(200).json({ 
            message: "Database connection successful", 
            totalInquiries: count 
        });
    } catch (err) {
        console.error("Database connection test failed:", err);
        return res.status(500).json({ 
            message: "Database connection failed", 
            error: err.message 
        });
    }
};

// Get inquiry by userId (single inquiry - for backward compatibility)
const getInquiryByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const inquiry = await Inquiry.findOne({ userId });
        return res.status(200).json({ inquiry: inquiry || null });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get all inquiries by userId
const getAllInquiriesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const inquiries = await Inquiry.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ inquiries: inquiries || [] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Add new inquiry
const addInquiry = async (req, res) => {
    const { userId, name, description, email, phone, status, priority, response, type } = req.body;
    console.log("Received inquiry data:", { userId, name, description, email, phone, status, priority, response, type });
    
    // Basic validation
    if (!description || description.trim() === '') {
        return res.status(400).json({ message: "Description is required" });
    }
    
    try {
        // derive default priority by type if not set
        const derivedPriority = priority || (type === 'complaint' ? 'high' : type === 'booking' ? 'high' : type === 'product' ? 'medium' : type === 'support' ? 'medium' : 'low');
        const inquiry = new Inquiry({ 
            userId,
            name: name || '', 
            description: description.trim(), 
            email: email || '', 
            phone: phone || '', 
            status: status || 'pending', 
            priority: derivedPriority, 
            response: response || '',
            type: type || 'general'
        });
        console.log("Created inquiry object:", inquiry);
        await inquiry.save();
        console.log("Inquiry saved successfully:", inquiry);
        return res.status(201).json({ inquiry });
    } catch (err) {
        console.error("Error adding inquiry:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: err.message || "Validation error",
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        return res.status(500).json({ 
            message: "Unable to add inquiry",
            error: err.message,
            details: err.toString()
        });
    }
};

// Get inquiry by ID (Mongo _id)
const getInquiryById = async (req, res) => {
    const id = req.params.id;
    try {
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        return res.status(200).json({ inquiry });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update inquiry
const updateInquiry = async (req, res) => {
    const id = req.params.id;
    const { name, description, email, phone, status, priority, response, type } = req.body;
    try {
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        // Update fields if provided
        if (name !== undefined) inquiry.name = name;
        if (description !== undefined) inquiry.description = description;
        if (email !== undefined) inquiry.email = email;
        if (phone !== undefined) inquiry.phone = phone;
        if (status !== undefined) inquiry.status = status;
        if (priority !== undefined) inquiry.priority = priority;
        if (response !== undefined) inquiry.response = response;
        if (type !== undefined) inquiry.type = type;

        await inquiry.save();
        // Auto-create notification when admin responds
        try {
            if (response && String(response).trim() !== "") {
                const Notification = require("../Model/notificationModel");
                await Notification.create({
                    userId: inquiry.userId || null,
                    type: 'inquiry_responded',
                    title: 'Your inquiry has been responded',
                    message: `Inquiry ${inquiry.inquiry_id}: ${response.substring(0, 120)}`,
                    metadata: { inquiryId: inquiry._id, inquiryCode: inquiry.inquiry_id }
                });
            }
        } catch (e) { console.log('Notify inquiry respond skipped:', e.message); }
        return res.status(200).json({ inquiry });
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

// Delete inquiry
const deleteInquiry = async (req, res) => {
    const id = req.params.id;
    try {
        const inquiry = await Inquiry.findByIdAndDelete(id);
        if (!inquiry) {
            return res.status(404).json({ message: "Unable to delete inquiry" });
        }
        return res.status(200).json({ message: "Inquiry deleted successfully", inquiry });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// User-scoped: Update own inquiry only if status is pending
const updateInquiryByUser = async (req, res) => {
    const { id, userId } = { id: req.params.id, userId: req.params.userId };
    const { name, description } = req.body;
    try {
        const inquiry = await Inquiry.findOne({ _id: id, userId });
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found for this user" });
        }
        if (inquiry.status !== 'pending') {
            return res.status(403).json({ message: "Cannot edit after admin response" });
        }
        if (name !== undefined) inquiry.name = name;
        if (description !== undefined) inquiry.description = description;
        await inquiry.save();
        return res.status(200).json({ inquiry });
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

// User-scoped: Delete own inquiry only if status is pending
const deleteInquiryByUser = async (req, res) => {
    const { id, userId } = { id: req.params.id, userId: req.params.userId };
    try {
        const inquiry = await Inquiry.findOne({ _id: id, userId });
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found for this user" });
        }
        if (inquiry.status !== 'pending') {
            return res.status(403).json({ message: "Cannot delete after admin response" });
        }
        await Inquiry.deleteOne({ _id: id, userId });
        return res.status(200).json({ message: "Inquiry deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllInquiries,
    testConnection,
    getInquiryByUser,
    getAllInquiriesByUser,
    addInquiry,
    getInquiryById,
    updateInquiry,
    deleteInquiry,
    updateInquiryByUser,
    deleteInquiryByUser,
};
