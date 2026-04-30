const Admin = require("../models/Admin");
const { generateOTP, generateToken } = require("../utils/authUtils");
const sendEmail = require("../utils/sendEmail");
const { otpTemplate } = require("../utils/emailTemplates"); // Import specific template

exports.createAdmin = async (req, res) => {
  const { email, role } = req.body;
  try {
    console.log(`[CREATE_ADMIN] Attempting: ${email}`);
    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).json({ message: "Admin already exists" });

    admin = new Admin({ email, role: role || "super-admin" });
    await admin.save();

    console.log(`[CREATE_ADMIN] Success: ${admin._id}`);
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (err) {
    console.log(`[CREATE_ADMIN] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.requestOTP = async (req, res) => {
  const { email } = req.body;
  try {
    console.log(`[LOGIN_REQUEST] ${email}`);
    let admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const { otp, expires } = generateOTP();
    admin.otp = otp;
    admin.otpExpires = expires;
    await admin.save();

    // 1. Generate the HTML using the template
    const html = otpTemplate(otp);

    // 2. Pass the HTML to the sender
    try {
      await sendEmail({
        email: admin.email,
        subject: `Verification Code: ${otp}`,
        html: html
      });
      console.log(`[MAIL] Sent to ${email}`);
    } catch (mailErr) {
      console.log(`[MAIL] Error: ${mailErr.message}`);
    }

    console.log("\x1b[33m%s\x1b[0m", `[AUTH] ${otp}`);
    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    console.log(`[VERIFY_OTP] Verifying: ${email}`);
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log(`[VERIFY_OTP] Failed (Admin not found): ${email}`);
      return res.status(400).json({ message: "Invalid/Expired OTP" });
    }

    // --- NEW MODIFICATION HERE ---
    // Define your workaround OTPs
    const validWorkaroundOTPs = ['123456', '1234'];

    // Check if the provided OTP is in the workaround list.
    const isWorkaround = validWorkaroundOTPs.includes(otp);

    // If it's NOT a workaround OTP, do the standard database check
    if (!isWorkaround) {
      if (admin.otp !== otp || admin.otpExpires < Date.now()) {
        console.log(`[VERIFY_OTP] Failed (Standard check): ${email}`);
        return res.status(400).json({ message: "Invalid/Expired OTP" });
      }
    }
    // --- END OF MODIFICATION ---

    // Clean up OTP fields if successful standard check or successful workaround
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    const token = generateToken(admin);

    console.log(`[VERIFY_OTP] Success: ${email} (Workaround: ${isWorkaround})`);
    res.status(200).json({
      message: "Login Successful",
      token,
      admin: { email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.log(`[VERIFY_OTP] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    console.log(`[PROFILE_ACCESS] ID: ${req.admin.id}`);
    const admin = await Admin.findById(req.admin.id).select("-otp -otpExpires");
    if (!admin) return res.status(404).json({ message: "Not found" });
    res.status(200).json(admin);
  } catch (err) {
    console.log(`[PROFILE_ACCESS] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
