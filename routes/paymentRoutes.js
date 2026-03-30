const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
// const { protect, admin } = require("../middleware/authMiddleware"); // Optional protection

// Route for the Dashboard Cards / Analytics
router.get("/stats", paymentController.getEarningsStats);

// Route for the Detailed Table
router.get("/all", paymentController.getAllPayments);

module.exports = router;