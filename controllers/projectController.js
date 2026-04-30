const Project = require("../models/Project");
const { uploadToBackblaze } = require("../utils/uploadToBackblaze");

// @desc    Create new project
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      slug,
      industry,

      projectOverview,
      process,
      designBreakDown,
      externalLink,
      isFeatured,
      // Destructure these to match your new frontend field names
      tag,
      timeline,
      shortDescription,
      strategy,
    } = req.body;

    // 1. Generate sanitized slug
    const projectSlug = slug
      ? slug.toLowerCase().replace(/\s+/g, "-")
      : title.toLowerCase().replace(/\s+/g, "-");

    // 2. Fix the "NaN" Error: Generate a numeric ID if not provided
    // This finds the count of projects and adds 1, ensuring a valid Number.
    const projectCount = await Project.countDocuments();
    const numericId = projectCount + 1;

    let heroImageUrl = null;
    let galleryUrls = [];

    // 3. Handle Hero/Cover Image upload
    if (req.files && req.files["image"]) {
      const heroFile = req.files["image"][0];
      heroImageUrl = await uploadToBackblaze(
        heroFile.buffer,
        heroFile.originalname,
        `projects/${projectSlug}/hero`
      );
    }

    // 4. Handle Gallery Array upload
    if (req.files && req.files["images"]) {
      const galleryPromises = req.files["images"].map((file) =>
        uploadToBackblaze(
          file.buffer,
          file.originalname,
          `projects/${projectSlug}/gallery`
        )
      );
      galleryUrls = await Promise.all(galleryPromises);
    }

    // 5. Create new project with matching field names
    const newProject = new Project({
      id: numericId, // No longer NaN
      title,
      slug: projectSlug,
      industry,
      tag, // Added to match frontend
      timeline, // Added to match frontend
      shortDescription, // Added to match frontend (mapped from shortDescription if preferred)
      projectOverview,
      strategy, // Added to match frontend
      process,
      designBreakDown,
      externalLink,
      isFeatured: isFeatured === "true" || isFeatured === true,
      imageUrl: heroImageUrl,
      images: galleryUrls,
    });

    await newProject.save();
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Project ID or Slug already exists in the registry.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
exports.updateProject = async (req, res) => {
  try {
    const { slug } = req.params;
    let updateData = { ...req.body };

    let project = await Project.findOne({ slug });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Determine the directory slug (either the existing one or the new one if being changed)
    const activeSlug = req.body.slug || slug;

    // 1. Process New Hero/Cover Image if provided
    if (req.files && req.files["image"]) {
      const heroFile = req.files["image"][0];
      updateData.imageUrl = await uploadToBackblaze(
        heroFile.buffer,
        heroFile.originalname,
        `projects/${activeSlug}/hero`
      );
    }

    // 2. Process New Gallery Images if provided
    if (req.files && req.files["images"]) {
      const galleryPromises = req.files["images"].map((file) =>
        uploadToBackblaze(
          file.buffer,
          file.originalname,
          `projects/${activeSlug}/gallery`
        )
      );
      updateData.images = await Promise.all(galleryPromises);
    }

    // Handle Booleans
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured =
        updateData.isFeatured === "true" || updateData.isFeatured === true;
    }

    project = await Project.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ id: 1 });
    res
      .status(200)
      .json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project by slug
exports.getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOneAndDelete({ slug });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
