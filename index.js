require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// --- ROUTE IMPORTS ---
const adminRoutes = require("./routes/adminRoutes");
const briefRoutes = require("./routes/briefRoutes");
const productsRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// --- 1. SPECIAL WEBHOOK ROUTE (CRITICAL ORDERING) ---
// This must stay ABOVE express.json() to handle raw Stripe signatures
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// --- 2. STANDARD MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Parses JSON for all other routes

// --- 3. DATABASE CONNECTION ---

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✨ Database Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// --- 4. API PROTOCOLS ---
app.use("/api/briefs", briefRoutes); // Client Project Briefs
app.use("/api/admin", adminRoutes); // Admin Auth & Tools
app.use("/api/products", productsRoutes); // Digital Store Assets
app.use("/api/orders", orderRoutes); // Order Fulfillment & Status
app.use("/api/payments", paymentRoutes); // Stripe Checkout Intents

// --- 5. INITIALIZATION ---
app.get("/", (req, res) => res.send("Emperor Guild API is live..."));

const PORT = process.env.PORT || 5930;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));
