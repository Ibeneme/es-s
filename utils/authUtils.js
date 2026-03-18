const jwt = require("jsonwebtoken");

exports.generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 mins
  return { otp, expires };
};

exports.generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET || "egs_secret_key_2026",
    { expiresIn: "1d" }
  );
};
