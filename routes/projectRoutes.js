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

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 50MB
});

// Configure the fields processing setup
const portfolioUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 30 },
  { name: "videos", maxCount: 20 }, // Changed from video (singular) to videos (array match)
]);

router.route("/").get(getProjects).post(portfolioUpload, createProject);


router
  .route("/:slug")
  .get(getProjectBySlug)
  .put(portfolioUpload, updateProject)
  .delete(deleteProject);

module.exports = router;
