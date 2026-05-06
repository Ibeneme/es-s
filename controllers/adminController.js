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
    
    // 1. Validate Admin existence
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Generate OTP data
    const { otp, expires } = generateOTP();
    admin.otp = otp;
    admin.otpExpires = expires;
    
    // 3. Save OTP to DB before attempting to send
    await admin.save();

    // 4. Generate the HTML using the template
    const html = otpTemplate(otp);

    // 5. Attempt to send Email (Wrapped in its own try-catch)
    try {
      await sendEmail({
        email: admin.email,
        subject: `Verification Code: ${otp}`,
        html: html
      });
      console.log(`[MAIL_SUCCESS] Sent to ${email}`);
    } catch (mailErr) {
      // We log the error, but we do NOT throw it
      console.error("\x1b[31m%s\x1b[0m", `[MAIL_FAILURE] Error: ${mailErr.message}`);
      console.log(`[AUTH_FALLBACK] Email failed, but proceeding. Use manual code below.`);
    }

    // 6. Log OTP to console regardless of mail status (Useful for local testing)
    console.log("\x1b[33m%s\x1b[0m", `[AUTH_DEBUG] OTP for ${email}: ${otp}`);

    // 7. Always return success if we reached this point
    return res.status(200).json({ 
      message: "OTP request processed",
      debugInfo: "Check server logs if email is not received" 
    });

  } catch (err) {
    // This catch only triggers if Database/Admin logic fails
    console.error(`[SERVER_ERROR] ${err.message}`);
    res.status(500).json({ error: "Internal server error during OTP generation" });
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
