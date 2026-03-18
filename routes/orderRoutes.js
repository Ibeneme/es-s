const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protectAdmin } = require("../middleware/auth"); // Your JWT/Admin protection middleware


router.get("/", orderController.getAdminOrders);

// 2. Update Order Status (Fulfillment Action)
// PATCH /api/orders/:id/status
// Body: { "status": "dispatched" }
router.patch("/:id/status", orderController.updateOrderStatus);

// 3. Get Single Order Details (Deep Dive)
// GET /api/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.productId"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
