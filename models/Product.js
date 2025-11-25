const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String },
  filename: { type: String }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    specifications: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // refer Category
    files: [fileSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
