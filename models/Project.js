// models/Project.js
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tag: { type: String, required: false }, // e.g., "Branding" or "Web Development"
    industry: { type: String, required: true },
    shortDescription: { type: String, required: true },

    // High-Impact Content Sections
    projectOverview: { type: String },
    process: { type: String },
    designBreakDown: { type: String },

    // Media Assets
    imageUrl: { type: String, required: true }, // Primary thumbnail
    images: [{ type: String }], // Array of gallery strings/URLs

    // Functional Links
    externalLink: { type: String }, // For the onClick/window.open logic
    timeline: { type: String }, 
    // Metadata for SEO/High-Velocity Filtering
    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Project", ProjectSchema);
