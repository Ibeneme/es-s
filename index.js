require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const adminRoutes = require("./routes/adminRoutes");
const briefRoutes = require("./routes/briefRoutes");
const productsRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const orderRoutes = require('./routes/orderRoutes')

const app = express();

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✨ Database Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.use("/api/briefs", briefRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => res.send("Emperor Guild API is live..."));

const PORT = process.env.PORT || 5930;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));
