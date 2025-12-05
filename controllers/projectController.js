const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");


// ADD PROJECT
exports.addProject = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILES:", req.files);

    const { title, description } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No images uploaded" });
    }

    const uploadedFiles = req.files.map((file) => ({
      url: file.path,       // Cloudinary URL
      type: file.mimetype.split("/")[0], // image, video, etc
      filename: file.filename || file.originalname,
    }));

    const project = new Project({
      title,
      description,
      images: uploadedFiles,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project added successfully",
      project,
    });
  } catch (err) {
    console.error("Add Project Error:", err.stack || err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// GET ALL PROJECTS
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("Get Projects Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({
      error: "Failed to fetch projects",
      details: err.message,
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
        error: "Project not found",
      });
    }

    res.json(project);
  } catch (err) {
    console.error("Get Project By ID Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({
      error: "Failed to fetch project",
      details: err.message,
    });
  }
};

// EDIT PROJECT
exports.editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
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
      updates.images = uploadedFiles;
      // To append to existing images, uncomment:
      // const existingProject = await Project.findById(id);
      // updates.images = [...(existingProject.images || []), ...uploadedFiles];
    }

    const project = await Project.findByIdAndUpdate(id, updates, { new: true });

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (err) {
    console.error("Edit Project Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({
      success: false,
      error: err.message,
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
        error: "Project not found",
      });
    }

    for (const img of project.images) {
      if (img.filename) {
        try {
          await cloudinary.uploader.destroy(img.filename);
        } catch (err) {
          console.error("Cloudinary delete failed:", err.stack || JSON.stringify(err, null, 2));
        }
      }
    }

    await Project.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error("Delete Project Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
