const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    paymentReference: { type: String, required: true, unique: true },
    amountPaidNGN: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paidAt: { type: Date },
    paymentDetails: { type: Object }, // Stores the full Paystack response for audits
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);