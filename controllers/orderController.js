const Order = require("../models/Order");

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // preparing, dispatched, delivered, received

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};
