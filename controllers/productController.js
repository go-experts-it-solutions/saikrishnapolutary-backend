const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");



// Add Product (Admin Only)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, specifications, category } = req.body;

    // console.log("aFD",name)

    // req.files if multiple files, req.file if single
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
      files: uploadedFiles, // store array of uploaded files
    });

    await product.save();
    res.json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Edit Product
exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Only pick permitted fields for update
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.specifications !== undefined) updates.specifications = req.body.specifications; // handle specifications
    if (req.body.category !== undefined) updates.category = req.body.category;

    const files = req.files || [];
    if (files.length > 0) {
      const uploadedFiles = files.map((file) => ({
        url: file.path,
        type: file.mimetype,
        filename: file.filename,
      }));
      updates.files = uploadedFiles; // replace existing files (append logic can be added if needed)
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Products (public)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    // Delete all files from Cloudinary
    if (product.files && product.files.length > 0) {
      for (const file of product.files) {
        if (file.filename) {
          try {
            await cloudinary.uploader.destroy(file.filename, {
              resource_type: "auto",
              invalidate: true
            });
            console.log(`Deleted file from Cloudinary: ${file.filename}`);
          } catch (cloudinaryError) {
            console.error(`Failed to delete ${file.filename}:`, cloudinaryError);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Product and associated files deleted successfully"
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch product",
      details: err.message
    });
  }
};



exports.getProductsByCategory = async (req, res) => {
  try {
    // Convert dashed slug to proper category (capitalize and replace dashes)
    const categorySlug = req.params.category;
    const category = categorySlug
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');

    // Query to match either the slug or the normalized category (recommended)
    const products = await Product.find({
      category: { $regex: new RegExp("^" + category + "$", "i") }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};