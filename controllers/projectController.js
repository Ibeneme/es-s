const Project = require("../models/Project");
const { uploadToBackblaze } = require("../utils/uploadToBackblaze");

// @desc    Create new project
exports.createProject = async (req, res) => {
  try {
    const {
      id,
      title,
      slug,
  
      industry,
      shortDescription,
      projectOverview,
      process,
      designBreakDown,
      externalLink,
      isFeatured,
    } = req.body;

    // Generate sanitized slug if not provided or to ensure format
    const projectSlug = slug
      ? slug.toLowerCase().replace(/\s+/g, "-")
      : title.toLowerCase().replace(/\s+/g, "-");

    let heroImageUrl = null;
    let galleryUrls = [];

    // 1. Handle Hero/Cover Image upload
    if (req.files && req.files["image"]) {
      const heroFile = req.files["image"][0];
      heroImageUrl = await uploadToBackblaze(
        heroFile.buffer,
        heroFile.originalname,
        `projects/${projectSlug}/hero`
      );
    }

    // 2. Handle Gallery Array upload
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

    const newProject = new Project({
      id: Number(id),
      title,
      slug: projectSlug,

      industry,
      shortDescription,
      projectOverview,
      process,
      designBreakDown,
      externalLink,
      isFeatured: isFeatured === "true" || isFeatured === true,
      imageUrl: heroImageUrl, // Main Hero URL
      images: galleryUrls, // Gallery Array URLs
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
