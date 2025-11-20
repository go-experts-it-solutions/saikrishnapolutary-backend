const mongoose = require("mongoose");

// Sub-schema for uploaded files (similar to Product)
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },      // Cloudinary URL
  type: { type: String },                     // image format (png/jpg)
  filename: { type: String },                 // Cloudinary public_id
});

const projectSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    images: [imageSchema],  // Array of image subdocuments
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
