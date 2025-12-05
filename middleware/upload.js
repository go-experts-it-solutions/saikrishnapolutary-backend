const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";
    const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
    const extension = path.extname(file.originalname);

    return {
      folder: "skplastic/products",
      resource_type: isPdf ? "raw" : "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "mp4", "mov"],
      public_id: isPdf ? `${nameWithoutExt}${extension}` : nameWithoutExt,
    };
  },
});

const upload = multer({ storage });
module.exports = upload;
