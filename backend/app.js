//pass= 2XINIMBJaAN6a05e

const express = require("express");
const mongoose = require("mongoose");
const productroutes = require("./Routes/productRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const userRoutes = require("./Routes/userRoutes");
const inquiryRoutes = require("./Routes/inquiryRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const path = require("path");
const multer = require("multer");
const app = express();
const cors = require("cors");

//Middleware
// app.use("/",(req, res, next) => {
//     res.send("It is working");
// })

app.use(express.json());
app.use(cors());

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

// Upload middleware is now defined in individual route files

// 👇 expose uploads folder for static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/products", productroutes); //users-variable name
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/inquiries", inquiryRoutes);
app.use("/reviews", reviewRoutes);
app.use("/notifications", notificationRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error', error: error.message });
});

// Test route to check if server is working
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!", timestamp: new Date() });
});

//Database Connection
mongoose
  .connect("mongodb+srv://admin:2XINIMBJaAN6a05e@cluster0.t2o1tnw.mongodb.net/")
  .then(() => console.log("Connected to MongoDB"))
  .then(async () => {
    // One-time safeguard: drop old unique index on userId in inquiries if it exists
    try {
      const collection = mongoose.connection.db.collection('inquirymodels');
      const indexes = await collection.indexes();
      const userIdUnique = indexes.find(idx => idx.key && idx.key.userId === 1 && idx.unique);
      if (userIdUnique) {
        await collection.dropIndex(userIdUnique.name);
        console.log('Dropped unique index on inquirymodels.userId');
      }
    } catch (e) {
      console.log('Index cleanup skipped:', e.message);
    }
  })
  .then(() => {
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => console.log("Database connection error:", err));
