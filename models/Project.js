const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tag: { type: String, required: false },
    industry: { type: String, required: true },
    shortDescription: { type: String, required: true },

    projectOverview: { type: String },
    process: { type: String },
    designBreakDown: { type: String },

    imageUrl: { type: String, required: true }, // Main cover
    images: [{ type: String }], // Images gallery array
    videos: [{ type: String }], // Videos gallery array
    externalLink: { type: String },
    timeline: { type: String },

    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
