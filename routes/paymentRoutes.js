const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/create-intent", paymentController.createPaymentIntent);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

module.exports = router;
