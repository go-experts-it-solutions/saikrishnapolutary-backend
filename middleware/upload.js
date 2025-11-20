const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "skplastic/products",   // <-- your folder
      resource_type: "auto",          // images + pdf + videos
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "mp4", "mov"],
      public_id: file.originalname.split('.')[0],   // optional: keeps filename clean
    };
  },
});

// Multer upload middleware
const upload = multer({ storage });

module.exports = upload;
