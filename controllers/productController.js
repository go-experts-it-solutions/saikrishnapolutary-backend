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

