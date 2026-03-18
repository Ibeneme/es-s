const mongoose = require("mongoose");

const ProjectBriefSchema = new mongoose.Schema({
  // Step 1: Company Information
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  website: { type: String },
  companySize: { type: String, required: true },
  industry: { type: String, required: true },

  // Step 2: Project Details
  projectType: { type: String, required: true },
  description: {
    type: String,
    required: true,
    minlength: 50,
  },
  businessObjectives: { type: String, required: true },
  targetAudience: { type: String, required: true },
  competitors: { type: String, required: true },
  uniqueSellingPoint: { type: String, required: true },

  // Step 3: Budget & Timeline
  budget: { type: String, required: true },
  timeline: { type: String, required: true },
  startDate: { type: Date, required: true },
  hasAssets: { type: String, default: "No" },
  additionalNotes: { type: String },

  // Step 4: Reference Files (Optional)
  assetLink: { type: String },

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProjectBrief", ProjectBriefSchema);
