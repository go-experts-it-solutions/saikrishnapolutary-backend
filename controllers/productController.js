const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Add Product (Admin Only)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, specifications, category } = req.body;

    const files = req.files || (req.file ? [req.file] : []);
    const uploadedFiles = files.map((file) => ({
      url: file.path,
      type: file.mimetype,
      filename: file.filename,
    }));

    const product = new Product({
      name,
      description,
      specifications,
      category,
      files: uploadedFiles,
    });

    await product.save();
    res.json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("Add Product error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ error: err.message });
  }
};

// Edit Product (Admin Only)
exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Only pick permitted fields for update
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.specifications !== undefined) updates.specifications = req.body.specifications;
    if (req.body.category !== undefined) updates.category = req.body.category;

    const files = req.files || [];
    if (files.length > 0) {
      const uploadedFiles = files.map((file) => ({
        url: file.path,
        type: file.mimetype,
        filename: file.filename,
      }));
      updates.files = uploadedFiles;
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("Edit Product error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ error: err.message });
  }
};

// Get All Products (Public)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Get Products error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
};

// Get Single Product by ID (Public)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID"
      });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error("Get Product By ID error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({
      error: "Failed to fetch product",
      details: err.message
    });
  }
};

// Delete Product (Admin Only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (product.files && product.files.length > 0) {
      for (const file of product.files) {
        if (file.filename) {
          try {
            await cloudinary.uploader.destroy(file.filename, {
              resource_type: "image",
            });
          } catch (err) {
            console.error("Cloudinary delete failed:", err.stack || JSON.stringify(err, null, 2));
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Delete Product error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ success: false, error: err.message });
  }
};
