const mongoose = require("mongoose");

// Sub-schema for uploaded files
const fileSchema = new mongoose.Schema({
  url: { type: String, required: true },      // Cloudinary URL
  type: { type: String },                     // MIME type (image/pdf/video)
  filename: { type: String },                 // Original filename
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: Number,
    category: String,
    files: [fileSchema],                       // Array of uploaded files
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
