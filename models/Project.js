const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    tag: { type: String, required: true },
    title: { type: String, required: true },
    shortDescription: { type: String },
    fullDescription: { type: String },
    industry: { type: String },
    process: { type: String },
    imageUrl: { type: String, required: true }, // Main thumbnail
    images: [{ type: String }], // Array of gallery strings
    slug: { type: String, required: true, unique: true },
    externalLink: { type: String }, // For the "window.open" logic
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
