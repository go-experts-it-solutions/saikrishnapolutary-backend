const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // your multer middleware
const auth = require("../middleware/auth");

const {
  addPdf,
  getPdfs,
  getPdfById,
  deletePdf
} = require("../controllers/pdfController");

// GET all PDFs
router.get("/getall", getPdfs);

// UPLOAD a PDF
router.post("/add", upload.single("pdf"), addPdf);

// GET single PDF by ID
router.get("/:id", getPdfById);

// DELETE a PDF
router.delete("/delete/:id", auth, deletePdf);

module.exports = router;
