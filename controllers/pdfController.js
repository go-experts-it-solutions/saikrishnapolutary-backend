const Pdf = require("../models/Pdf");
const cloudinary = require("cloudinary").v2;

// Add a PDF
exports.addPdf = async (req, res) => {
  try {
    const { title } = req.body;
    const fileUrl = req.file?.path;

    if (!title || !fileUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Title and PDF required" });
    }

    // Add fl_attachment to force download
    const downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');

    const newPdf = await Pdf.create({
      title,
      url: downloadUrl, // Store the download-enabled URL
    });

    res.json({ success: true, data: newPdf });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message,
    });
  }
};

// Get all PDFs
exports.getPdfs = async (req, res) => {
  try {
    const pdfs = await Pdf.find().sort({ createdAt: -1 });
    res.json({ success: true, data: pdfs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch PDFs" });
  }
};

// Get single PDF by ID
exports.getPdfById = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ success: false, message: "PDF not found" });
    res.json({ success: true, data: pdf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch PDF" });
  }
};

// Delete PDF
exports.deletePdf = async (req, res) => {
  try {
    const pdf = await Pdf.findByIdAndDelete(req.params.id);
    if (!pdf) return res.status(404).json({ success: false, message: "PDF not found" });
    res.json({ success: true, message: "PDF deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete PDF" });
  }
};
