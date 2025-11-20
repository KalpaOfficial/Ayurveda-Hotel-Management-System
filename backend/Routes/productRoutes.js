const express = require("express");
const router = express.Router();

//insert model
const Product = require("../Model/productModel");

//insert User Contraller
const ProductController = require("../Controllers/productControllers");


const multer = require("multer");
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save in /uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage: storage });


//route path create
router.get("/", ProductController.getAllProducts); //get data
router.post("/", upload.single("p_image"),ProductController.addProducts); //insert data
router.get("/:id", ProductController.getById); //get by id
router.put("/:id", upload.single("p_image"),ProductController.updateProduct); //update by id
router.delete("/:id", ProductController.deleteProduct); //delete by id

//export
module.exports = router;
