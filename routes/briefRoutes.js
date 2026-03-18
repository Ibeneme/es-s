const express = require("express");
const router = express.Router();
const ProjectBrief = require("../models/ProjectBrief");
const { briefConfirmationTemplate } = require("../utils/emailTemplates");
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const briefData = new ProjectBrief(req.body);
    const savedBrief = await briefData.save();

    // 1. Prepare Email Content
    const emailHtml = briefConfirmationTemplate(savedBrief);

    // 2. Send Confirmation Email to Client
    await sendEmail({
      to: savedBrief.email,
      subject: `Project Transmission: ${savedBrief.companyName}`,
      html: emailHtml,
    });

    res.status(201).json({
      success: true,
      message: "Your project brief has been transmitted successfully!",
      briefId: savedBrief._id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Data transmission failed",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const briefs = await ProjectBrief.find().sort({ submittedAt: -1 });
    res.json(briefs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
