const express = require("express");
const router = express.Router();
const { 
  getCategories,    // GET /getallcategories
  addCategory,      // POST /add
} = require("../controllers/categoryController");

const auth = require("../middleware/auth");

// Get ALL categories
router.get("/getallcategories", getCategories);

// Create a new category, only for authenticated admin
router.post("/add", auth, addCategory);

module.exports = router;
