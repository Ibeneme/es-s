const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      default: "super-admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
