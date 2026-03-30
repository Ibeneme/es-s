const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    address: { type: String, required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        image: String,
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      // Added: intransit and received
      enum: ["processing", "intransit", "received", "completed", "cancelled"],
      default: "processing",
    },
    paymentReference: { type: String }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);