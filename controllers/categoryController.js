const Category = require("../models/Category");

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, "_id name");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Add new category
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(400).json({ error: "Could not create category" });
  }
};



exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Optionally, check if any products still reference this category before deleting
    // const Product = require("../models/Product");
    // const productCount = await Product.countDocuments({ category: id });
    // if (productCount > 0) {
    //   return res.status(400).json({ error: "Cannot delete category: products are still using this category." });
    // }

    const result = await Category.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};
