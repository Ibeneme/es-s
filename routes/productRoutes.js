const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/productController");

// Configure Multer for Memory Storage (so we get the buffer for Backblaze)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public Routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Admin Only Routes
router.post("/", upload.single("image"), productController.createProduct);
router.put("/:id", upload.single("image"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
