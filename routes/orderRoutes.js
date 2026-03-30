const router = require("express").Router();
const {
  createOrder,
  getAllOrders,
  getOrdersByEmail,
  updateOrder,
  deleteOrder,
  verifyOrder, // Import the new verification controller
  adminUpdateStatus
} = require("../controllers/orderController");

// --- PUBLIC / USER ROUTES ---

// Initialize a new order and get Paystack checkout URL
router.post("/", createOrder);

router.get("/verify/:reference", verifyOrder);

// Get order history for a specific user
router.get("/user/:email", getOrdersByEmail);

// --- ADMIN / MANAGEMENT ROUTES ---

// Fetch all orders for the admin dashboard
router.get("/", getAllOrders);

// Update order details (will regenerate checkout URL if unpaid)
router.put("/:id", updateOrder);
router.put("/admin/:id/status", adminUpdateStatus);
// Remove an order from the archive
router.delete("/:id", deleteOrder);

module.exports = router;