const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");

// Only use registerAdmin ONCE to create your admin
router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

module.exports = router;
