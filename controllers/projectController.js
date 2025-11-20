const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");

// ADD PROJECT (following Product pattern)
exports.addProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    // req.files if multiple files, req.file if single
    const files = req.files || (req.file ? [req.file] : []);

    const uploadedFiles = [];

    // Upload each file to Cloudinary
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "skplastic/projects",
        resource_type: "auto",
        public_id: file.originalname.split(".")[0],
      });

      uploadedFiles.push({
        url: result.secure_url,
        type: result.format,
        filename: result.public_id,
      });
    }

    const project = new Project({
      title,
      description,
      images: uploadedFiles, // array of objects
    });

    await project.save();
    res.status(201).json({ 
      success: true,
      message: "Project added successfully", 
      project 
    });
  } catch (err) {
    console.error("Add Project Error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// GET ALL PROJECTS
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ 
      error: "Failed to fetch projects", 
      details: err.message 
    });
  }
};

// GET SINGLE PROJECT
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: "Project not found" 
      });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ 
      error: "Failed to fetch project", 
      details: err.message 
    });
  }
};

// EDIT PROJECT (following Product pattern)
exports.editProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Copy text fields from req.body
    const updates = { ...req.body };

    // Handle uploaded files (multiple)
    const files = req.files || [];
    if (files.length > 0) {
      const uploadedFiles = [];

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "skplastic/projects",
          resource_type: "auto",
          public_id: file.originalname.split(".")[0],
        });

        uploadedFiles.push({
          url: result.secure_url,
          type: result.format,
          filename: result.public_id,
        });
      }

      // Replace existing images
      updates.images = uploadedFiles;
      
      // Or append to existing (uncomment if needed):
      // const existingProject = await Project.findById(id);
      // updates.images = [...(existingProject.images || []), ...uploadedFiles];
    }

    const project = await Project.findByIdAndUpdate(id, updates, { new: true });

    res.json({ 
      success: true,
      message: "Project updated successfully", 
      project 
    });
  } catch (err) {
    console.error("Edit Project Error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: "Project not found" 
      });
    }

    // Optional: Delete images from Cloudinary
    for (const img of project.images) {
      if (img.filename) {
        await cloudinary.uploader.destroy(img.filename);
      }
    }

    await Project.findByIdAndDelete(id);
    res.json({ 
      success: true,
      message: "Project deleted successfully" 
    });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
