const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      title: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    },
  ],
  totalAmount: { type: Number, required: true },
  stripePaymentIntentId: { type: String, unique: true },

  // Delivery Address Protocol
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    postalCode: { type: String },
  },

  // Status Management
  status: {
    type: String,
    enum: ["preparing", "dispatched", "delivered", "received"],
    default: "preparing",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
