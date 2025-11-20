const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const {
  addContact,
  getContacts,
  getContactById,
  getNearbyStores,
  editContact,
  deleteContact,
} = require("../controllers/contactController");

// Public routes
router.get("/all", getContacts);
router.get("/nearby", getNearbyStores); // ?latitude=17.385&longitude=78.486&maxDistance=5000
router.get("/:id", getContactById);

// Admin routes (protected)
router.post("/add", auth, upload.array("images", 5), addContact);
router.put("/edit/:id", auth, upload.array("images", 5), editContact);
router.delete("/delete/:id", auth, deleteContact);

module.exports = router;
