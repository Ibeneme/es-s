const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createProject,
  getProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

/**
 * DEFINE MULTI-FIELD UPLOAD
 * 'image' -> The Hero/Cover image (max 1)
 * 'images' -> The Project Gallery array (max 12)
 */
const portfolioUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 12 },
]);

// MAIN COLLECTION ROUTES
router.route("/").get(getProjects).post(portfolioUpload, createProject);

// SPECIFIC PROJECT ROUTES
router
  .route("/:slug")
  .get(getProjectBySlug)
  .put(portfolioUpload, updateProject)
  .delete(deleteProject);

module.exports = router;
