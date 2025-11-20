const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const {
  addProject,
  getProjects,
  getProjectById,
  editProject,
  deleteProject,
} = require("../controllers/projectController");

// Public routes
router.get("/all", getProjects);
router.get("/:id", getProjectById);

// Admin routes (protected)
router.post("/addproject", auth, upload.array("images", 10), addProject);
router.put("/edit/:id", auth, upload.array("images", 10), editProject);
router.delete("/delete/:id", auth, deleteProject);

module.exports = router;
