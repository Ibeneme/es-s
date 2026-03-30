const Payment = require("../models/Payment"); // Path to your schema

/**
 * @desc Get all payments with pagination for the Dashboard Table
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { paymentStatus: status } : {};

    const payments = await Payment.find(query)
      .populate("orderId", "email items totalAmount") // Pull order details
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Payment.countDocuments(query);

    res.status(200).json({
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPayments: count,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve archive.", error: err.message });
  }
};

/**
 * @desc Get aggregated earnings and stats for Dashboard Cards
 */
exports.getEarningsStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amountPaidNGN" },
          totalTransactions: { $count: {} },
          averageOrderValue: { $avg: "$amountPaidNGN" },
        },
      },
    ]);

    // Get earnings grouped by month for a chart
    const monthlyEarnings = await Payment.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $month: "$paidAt" },
          amount: { $sum: "$amountPaidNGN" },
        },
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
      summary: stats[0] || { totalEarnings: 0, totalTransactions: 0 },
      chartData: monthlyEarnings,
    });
  } catch (err) {
    res.status(500).json({ message: "Analytics retrieval failed.", error: err.message });
  }
};