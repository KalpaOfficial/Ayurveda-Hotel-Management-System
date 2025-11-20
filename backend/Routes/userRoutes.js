const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/userController");
const multer = require("multer");
const path = require("path");

// Multer configuration for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ✅ User Management Routes
router.get("/", UserController.getAllUsers);       // Get all users
router.get("/:id", UserController.getById);       // Get user by ID
router.put("/update/:id", upload.single('profilePicture'), UserController.updateUser);    // Update user with profile picture
router.delete("/:id", UserController.deleteUser); // Delete user

// ✅ Authentication Routes
router.post("/signup", upload.single('profilePicture'), UserController.addUser);   // Register new user with profile picture
router.post("/login", UserController.loginUser);  // User login

// ✅ Optional: Admin-specific routes can be added later
// e.g., router.get("/admin/dashboard", UserController.adminDashboard);

module.exports = router;
