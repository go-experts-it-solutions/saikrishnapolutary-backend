const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const {
  addProduct,
  getProducts,
  editProduct
} = require("../controllers/productController");

// Public Route → Anyone can see products
router.get("/getallproducts", getProducts);

// Protected Routes → Only Admin
router.post("/add", auth, upload.array("files"), addProduct);
router.put("/edit/:id", auth,  upload.array("files"),editProduct);
// router.delete("/delete/:id", auth, deleteProduct);

module.exports = router;
