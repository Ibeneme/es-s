const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // Changed from 'name' to 'title'
  desc: { type: String, required: true }, // Changed from 'description' to 'desc'
  price: { type: Number, required: true },
  
  // New fields to match your React component
  type: { 
    type: String, 
    required: true, 
    enum: ["Templates", "Ebooks", "Wallpapers", "Presets"] 
  },
  format: { type: String, required: true }, // e.g., "PDF", "Figma", "AE Preset"
  tag: { type: String }, // e.g., "Bestseller", "Trending", "New"
  
  image: { type: String }, // The URL from Backblaze B2
  
  // Analytics & Metadata
  stock: { type: Number, default: 999 }, // High default for digital products
  isDigital: { type: Boolean, default: true },
  status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);