//model ake data contro karanawa
const fs = require("fs");
const path = require("path");
//model eka insert karanawa
const Product = require("../Model/productModel");

//All data display
const getAllProducts = async (req, res, next) => {
  let products; //variable assign

  //check users are available
  try {
    products = await Product.find();
  } catch (err) {
    console.log(err);
  }

  //not found
  if (!products) {
    return res.status(404).json({ message: "products not found" });
  }

  //display all users
  return res.status(200).json({ products });
};

//data insert
const addProducts = async (req, res, next) => {
  const { p_name, p_description, p_price, p_quantity, p_catogory } = req.body;

  let product;
  try {
    product = new Product({
      p_name,
      p_description,
      p_price,
      p_quantity,
      p_catogory,
      p_image: req.file ? `/uploads/${req.file.filename}` : "", // save path
    });

    await product.save();
    // Auto-broadcast notification for new product
    try {
      const Notification = require("../Model/notificationModel");
      await Notification.create({
        userId: null,
        type: 'product_new',
        title: 'New product added',
        message: `${product.p_name} is now available`,
        metadata: { productId: product._id }
      });
    } catch (e) { console.log('Notify new product skipped:', e.message); }
    return res.status(200).json({ product });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to add product" });
  }
};


//get by id
const getById = async (req, res, next) => {
  const id = req.params.id; //productRouters - "/:id"

  let product;

  try {
    product = await Product.findById(id);
  } catch (err) {
    console.log(err);
  }

  //not available product
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  return res.status(200).json({ product });
};

//Update product
const updateProduct = async (req, res, next) => {
  const id = req.params.id;
  const { p_name, p_description, p_price, p_quantity, p_catogory } = req.body;

  let product;
  try {
    product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    product.p_name = p_name;
    product.p_description = p_description;
    product.p_price = p_price;
    product.p_quantity = p_quantity;
    product.p_catogory = p_catogory;

    // If new image uploaded
    if (req.file) {
      // delete old image
      if (product.p_image) {
        const oldPath = path.join(__dirname, "..", "uploads", path.basename(product.p_image));
        fs.unlink(oldPath, (err) => {
          if (err) console.log("Old image delete error:", err);
        });
      }
      product.p_image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    return res.status(200).json({ product });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Update failed" });
  }
};

//Delete product
const deleteProduct = async (req, res, next) => {
  const id = req.params.id;

  let product;

  try {
    product = await Product.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }

  //not available product
  if (!product) {
    return res.status(404).json({ message: "unable to delete product" });
  }
  return res.status(200).json({ product });
};

exports.getAllProducts = getAllProducts; //route ekata export karagannawa
exports.addProducts = addProducts;
exports.getById = getById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
