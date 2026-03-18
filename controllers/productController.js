const Product = require("../models/Product");
const { uploadToBackblaze } = require("../utils/uploadToBackblaze");

// --- CREATE PRODUCT ---
exports.createProduct = async (req, res) => {
  try {
    // Destructure based on your new React-aligned naming
    const { title, desc, price, type, format, tag, isDigital } = req.body;
    let imageUrl = "";

    if (req.file) {
      // Upload to Backblaze using your existing utility
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        "digital-store"
      );
    }

    const newProduct = new Product({
      title,
      desc,
      price,
      type,
      format,
      tag,
      isDigital,
      image: imageUrl, // Storing the B2 link in 'image' to match frontend
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- UPDATE PRODUCT ---
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // If a new image is uploaded, swap the URL
    if (req.file) {
      const newImageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        "products"
      );
      updateData.imageUrl = newImageUrl;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET ALL PRODUCTS ---
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET SINGLE PRODUCT ---
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DELETE PRODUCT ---
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product purged from system" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
