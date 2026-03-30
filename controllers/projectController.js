const Project = require("../models/Project");
const { uploadToBackblaze } = require("../utils/uploadToBackblaze"); // Adjust path as needed

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ id: 1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single project by slug
exports.getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new project with Image Upload
// controllers/projectController.js

exports.createProject = async (req, res) => {
    try {
      const projectData = { ...req.body };
  
      // 1. Check if file exists in the request
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }
  
      // 2. Upload to Backblaze first to get the URL
      const uploadedUrl = await uploadToBackblaze(
        req.file.buffer, 
        req.file.originalname, 
        "portfolio"
      );
  
      // 3. Manually set the imageUrl field so validation passes
      projectData.imageUrl = uploadedUrl;
  
      // 4. Now save to MongoDB
      const newProject = await Project.create(projectData);
      res.status(201).json(newProject);
      
    } catch (err) {
      console.error("Backend Error:", err);
      res.status(400).json({ message: err.message });
    }
  };

// Edit project with optional new Image
exports.updateProject = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // If a new image is provided during the edit
    if (req.file) {
      console.log("📸 New image detected for update...");
      const imageUrl = await uploadToBackblaze(
        req.file.buffer, 
        req.file.originalname, 
        "portfolio-assets"
      );
      updateData.imageUrl = imageUrl;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};