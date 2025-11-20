const Product = require("../models/Product");

// Add Product (Admin Only)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

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
      price,
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

    // Copy text fields from req.body
    const updates = { ...req.body };

    // Handle uploaded files (multiple)
    const files = req.files || [];
    if (files.length > 0) {
      const uploadedFiles = files.map((file) => ({
        url: file.path,
        type: file.mimetype,
        filename: file.filename,
      }));

      // Either replace or append to existing files
      updates.files = uploadedFiles; // Replace existing files
      // If you want to append instead: 
      // const existingProduct = await Product.findById(id);
      // updates.files = [...(existingProduct.files || []), ...uploadedFiles];
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



exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product first to get file details
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
              resource_type: "auto", // handles images, videos, raw files
              invalidate: true // clears CDN cache
            });
            console.log(`Deleted file from Cloudinary: ${file.filename}`);
          } catch (cloudinaryError) {
            console.error(`Failed to delete ${file.filename}:`, cloudinaryError);
            // Continue with deletion even if Cloudinary fails
          }
        }
      }
    }

    // Delete the product from database
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