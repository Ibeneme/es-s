const Order = require("../models/Order");
const Payment = require("../models/Payment");
const axios = require("axios");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// --- HELPER: Initialize Paystack ---
const initializePaystack = async (email, amount, orderId) => {
  const reference = `ord_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`;

  // Explicitly using your localhost:5175 for the redirect
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5175";

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: Math.round(amount * 100), // Kobo conversion
      reference,
      callback_url: `${frontendUrl}/verify-order?reference=${reference}`,
      metadata: { orderId },
    },
    {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    }
  );
  return {
    checkout_url: response.data.data.authorization_url,
    reference,
  };
};

// --- CREATE ORDER ---
exports.createOrder = async (req, res) => {
  try {
    const { email, address, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Deployment archive is empty." });
    }

    const newOrder = new Order({
      email,
      address,
      items,
      totalAmount,
      paymentStatus: "pending",
    });

    const savedOrder = await newOrder.save();

    // Generate Paystack session with redirect to 5175
    const payData = await initializePaystack(
      email,
      totalAmount,
      savedOrder._id
    );

    // Update order with reference
    savedOrder.paymentReference = payData.reference;
    await savedOrder.save();

    // Create tracking payment record
    await Payment.create({
      orderId: savedOrder._id,
      amountPaidNGN: totalAmount,
      paymentReference: payData.reference,
      paymentStatus: "pending",
    });

    res.status(201).json({
      ...savedOrder._doc,
      checkout_url: payData.checkout_url,
      reference: payData.reference,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- VERIFY PAYMENT ---
exports.verifyOrder = async (req, res) => {
  const { reference } = req.params;

  try {
    const paymentRecord = await Payment.findOne({
      paymentReference: reference,
    });
    if (!paymentRecord)
      return res.status(404).json({ error: "Protocol record not found" });

    if (paymentRecord.paymentStatus === "paid") {
      const order = await Order.findById(paymentRecord.orderId);
      return res
        .status(200)
        .json({ success: true, message: "Already verified", order });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );

    const data = response.data.data;

    // SAFETY CHECK 1: Status Check
    if (data.status !== "success") {
      return res
        .status(400)
        .json({ success: false, message: "Transaction failed at source." });
    }

    // SAFETY CHECK 2: Amount Mismatch (Comparing Kobo)
    const expectedKobo = Math.round(paymentRecord.amountPaidNGN * 100);
    if (data.amount !== expectedKobo) {
      paymentRecord.paymentStatus = "failed";
      await paymentRecord.save();
      return res
        .status(400)
        .json({ error: "CRITICAL: Amount mismatch detected." });
    }

    // Update Payment Record
    paymentRecord.paymentStatus = "paid";
    paymentRecord.paidAt = new Date();
    paymentRecord.paymentDetails = data;
    await paymentRecord.save();

    // Update the actual Order
    const order = await Order.findById(paymentRecord.orderId);
    if (order) {
      order.paymentStatus = "paid";
      order.paymentReference = reference;
      await order.save();
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- UPDATE ORDER ---
exports.updateOrder = async (req, res) => {
  try {
    if (req.body.paymentStatus) delete req.body.paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    let checkout_url = null;

    if (updatedOrder.paymentStatus !== "paid") {
      const payData = await initializePaystack(
        updatedOrder.email,
        updatedOrder.totalAmount,
        updatedOrder._id
      );

      updatedOrder.paymentReference = payData.reference;
      await updatedOrder.save();

      await Payment.create({
        orderId: updatedOrder._id,
        amountPaidNGN: updatedOrder.totalAmount,
        paymentReference: payData.reference,
        paymentStatus: "pending",
      });

      checkout_url = payData.checkout_url;
    }

    res.status(200).json({ ...updatedOrder._doc, checkout_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- ADMIN GETTERS ---
// --- ADMIN GETTERS ---
exports.getAllOrders = async (req, res) => {
  try {
    // Fetch all orders and sort by newest first
    const orders = await Order.find().sort({ createdAt: -1 });

    // Console log the results for protocol verification
    if (!orders || orders.length === 0) {
      console.log("📂 ARCHIVE STATUS: NULL / EMPTY");
    } else {
      console.log(`📂 ARCHIVE SYNC: ${orders.length} orders retrieved.`);
      // Optional: console.log(JSON.stringify(orders, null, 2)); // Detailed view
    }

    // Return the response
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ ARCHIVE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrdersByEmail = async (req, res) => {
  try {
    // 1. Log the incoming parameter
    console.log("--- ORDER FETCH PROTOCOL ---");
    console.log("RAW EMAIL FROM PARAMS:", req.params.email);

    const targetEmail = req.params.email.toLowerCase();
    console.log("NORMALIZED EMAIL (LOWERCASE):", targetEmail);

    const orders = await Order.find({ email: targetEmail }).sort({
      createdAt: -1,
    });

    console.log(
      `DATABASE RESULT: Found ${orders.length} orders for ${targetEmail}`
    );

    if (orders.length > 0) {
      console.log("LATEST ORDER ID:", orders[0]._id);
    } else {
      console.log(
        "WARNING: No orders found. Check if the email in the DB is also lowercase."
      );
    }
    console.log("----------------------------");

    res.status(200).json(orders);
  } catch (err) {
    console.error("CRITICAL ERROR IN GET_ORDERS:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Deployment record purged.");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- ADMIN: UPDATE ORDER STATUS ONLY ---
exports.adminUpdateStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ["processing", "intransit", "received", "completed", "cancelled"];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid status protocol." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { orderStatus: orderStatus } },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found." });

    console.log(`🛠️ ADMIN STATUS UPDATE: Order ${order._id} moved to ${orderStatus}`);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
