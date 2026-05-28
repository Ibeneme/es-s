const Project = require("../models/Project");
const { uploadToBackblaze } = require("../utils/uploadToBackblaze");

// @desc    Create new project
exports.createProject = async (req, res) => {
  try {
    console.log("--- BACKEND CREATE ENTRY ---");
    console.log("Body contents parsed:", req.body);
    console.log(
      "Available files dictionary keys:",
      req.files ? Object.keys(req.files) : "None"
    );

    const {
      title,
      slug,
      industry,
      projectOverview,
      process,
      designBreakDown,
      externalLink,
      isFeatured,
      tag,
      timeline,
      shortDescription,
      strategy,
    } = req.body;

    // 1. Generate Base Slug (Mix title + tag if custom slug isn't provided)
    let baseSlug = "";
    if (slug && slug.trim() !== "") {
      baseSlug = slug.toLowerCase().replace(/\s+/g, "-");
    } else {
      const mixedString = tag ? `${title} ${tag}` : title;
      baseSlug = mixedString
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove weird special characters
        .trim()
        .replace(/\s+/g, "-"); // Convert spaces to single dashes
    }

    // 2. Prevent Duplicate Slugs
    let projectSlug = baseSlug;
    let slugExists = await Project.findOne({ slug: projectSlug });
    let counter = 1;

    console.log(
      `[SLUG CHECK] Testing initial slug candidate: "${projectSlug}"`
    );

    while (slugExists) {
      projectSlug = `${baseSlug}-${counter}`;
      console.log(
        `[SLUG CONFLICT] "${baseSlug}" taken. Retrying with variant: "${projectSlug}"`
      );
      slugExists = await Project.findOne({ slug: projectSlug });
      counter++;
    }

    console.log(`[SLUG FINALIZED] Unique slug determined: "${projectSlug}"`);

    // 3. Generate numeric ID safely
    const highestProject = await Project.findOne()
      .sort({ id: -1 })
      .select("id");
    const numericId =
      highestProject && highestProject.id ? highestProject.id + 1 : 1;

    console.log(
      `[ID GENERATION] Highest existing database ID: ${
        highestProject?.id || 0
      } | Assigned target ID: ${numericId}`
    );

    let heroImageUrl = null;
    let galleryUrls = [];
    let videoUrls = [];

    // Helper Function: Sanitize filename paths to prevent Backblaze B2 breakages on special characters
    const getSanitizedFilename = (filename) => {
      const extIndex = filename.lastIndexOf(".");
      const ext = extIndex !== -1 ? filename.substring(extIndex) : "";
      const baseName =
        extIndex !== -1 ? filename.substring(0, extIndex) : filename;

      const cleanBase = baseName
        .replace(/[^a-zA-Z0-9]/g, "_") // Swap spaces, dots, percent encodings, and brackets with clean underscores
        .replace(/_+/g, "_"); // Flatten out recursive duplicate underscores

      return `${cleanBase}${ext}`;
    };

    // 4. Handle Cover Image Upload
    if (req.files && req.files["image"]) {
      console.log("Processing Cover image upload...");
      const heroFile = req.files["image"][0];
      const safeName = getSanitizedFilename(heroFile.originalname);

      heroImageUrl = await uploadToBackblaze(
        heroFile.buffer,
        safeName,
        `projects/${projectSlug}/hero`
      );
    }

    // 5. Handle Gallery Images array upload
    if (req.files && req.files["images"]) {
      console.log(
        `Processing ${req.files["images"].length} gallery image files...`
      );
      const galleryPromises = req.files["images"].map((file) => {
        const safeName = getSanitizedFilename(file.originalname);
        return uploadToBackblaze(
          file.buffer,
          safeName,
          `projects/${projectSlug}/gallery`
        );
      });
      galleryUrls = await Promise.all(galleryPromises);
    }

    // 6. Handle Gallery Videos array upload (Fixed 404 Path Parsing issue here)
    if (req.files && req.files["videos"]) {
      console.log(
        `Processing ${req.files["videos"].length} video gallery files...`
      );
      const videoPromises = req.files["videos"].map((file) => {
        const safeName = getSanitizedFilename(file.originalname);
        console.log(
          `[B2 SANITIZATION] Rewriting original video file string "${file.originalname}" to normalized asset format: "${safeName}"`
        );

        return uploadToBackblaze(
          file.buffer,
          safeName,
          `projects/${projectSlug}/videos`
        );
      });
      videoUrls = await Promise.all(videoPromises);
    }

    // 7. Initialize Document Instance
    const newProject = new Project({
      id: numericId,
      title,
      slug: projectSlug,
      industry,
      tag,
      timeline,
      shortDescription,
      projectOverview,
      strategy,
      process,
      designBreakDown,
      externalLink,
      isFeatured: isFeatured === "true" || isFeatured === true,
      imageUrl: heroImageUrl,
      images: galleryUrls,
      videos: videoUrls,
    });

    await newProject.save();
    console.log(
      "Project successfully saved inside MongoDB instance without indexing issues."
    );
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    console.error("Error encountered in createProject handler:", error);
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
    console.log(`--- BACKEND UPDATE ENTRY FOR SLUG: ${slug} ---`);
    console.log("Body properties received:", req.body);
    console.log(
      "Available files dictionary keys:",
      req.files ? Object.keys(req.files) : "None"
    );

    let project = await Project.findOne({ slug });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Keep payload clean
    let updateData = { ...req.body };
    const activeSlug = req.body.slug || slug;

    // Helper Function: Sanitize filenames to prevent Backblaze B2 404/space breakages
    const getSanitizedFilename = (filename) => {
      const extIndex = filename.lastIndexOf(".");
      const ext = extIndex !== -1 ? filename.substring(extIndex) : "";
      const baseName =
        extIndex !== -1 ? filename.substring(0, extIndex) : filename;

      const cleanBase = baseName
        .replace(/[^a-zA-Z0-9]/g, "_") // Swap spaces, dots, and odd characters with underscores
        .replace(/_+/g, "_"); // Collapse duplicate underscores

      return `${cleanBase}${ext}`;
    };

    // 1. Process New Hero Image
    if (req.files && req.files["image"]) {
      console.log("Replacing Cover image...");
      const heroFile = req.files["image"][0];
      const safeName = getSanitizedFilename(heroFile.originalname);

      updateData.imageUrl = await uploadToBackblaze(
        heroFile.buffer,
        safeName,
        `projects/${activeSlug}/hero`
      );
    }

    // 2. Process Gallery Images (Merge Retained + New)
    let finalImages = [];
    if (req.body.existingImages) {
      try {
        finalImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        finalImages = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [];
      }
    } else {
      // Fallback if frontend didn't pass it: preserve current db state
      finalImages = project.images || [];
    }

    if (req.files && req.files["images"]) {
      console.log(`Uploading ${req.files["images"].length} new images...`);
      const galleryPromises = req.files["images"].map((file) => {
        const safeName = getSanitizedFilename(file.originalname);
        return uploadToBackblaze(
          file.buffer,
          safeName,
          `projects/${activeSlug}/gallery`
        );
      });
      const newImages = await Promise.all(galleryPromises);
      finalImages = [...finalImages, ...newImages]; // Merge them cleanly
    }
    updateData.images = finalImages;

    // 3. Process Gallery Videos (Merge Retained + New Sanitized Videos)
    let finalVideos = [];
    if (req.body.existingVideos) {
      try {
        finalVideos = JSON.parse(req.body.existingVideos);
      } catch (e) {
        finalVideos = Array.isArray(req.body.existingVideos)
          ? req.body.existingVideos
          : [];
      }
    } else {
      // Fallback if frontend didn't pass it: preserve current db state
      finalVideos = project.videos || [];
    }

    if (req.files && req.files["videos"]) {
      console.log(`Uploading ${req.files["videos"].length} new videos...`);
      const videoPromises = req.files["videos"].map((file) => {
        const safeName = getSanitizedFilename(file.originalname);
        console.log(
          `[B2 UPDATE SANITIZATION] Transforming original video string "${file.originalname}" into safe reference: "${safeName}"`
        );

        return uploadToBackblaze(
          file.buffer,
          safeName,
          `projects/${activeSlug}/videos`
        );
      });
      const newVideos = await Promise.all(videoPromises);
      finalVideos = [...finalVideos, ...newVideos]; // Merge them cleanly
    }
    updateData.videos = finalVideos;

    // 4. Normalize booleans
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured =
        updateData.isFeatured === "true" || updateData.isFeatured === true;
    }

    // 5. Update Database Record
    project = await Project.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    });

    console.log("Project information updated successfully.");
    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error tracking update operation process:", error);
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
