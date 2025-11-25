const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const {
  addProduct,
  getProducts,
  editProduct,
  deleteProduct,
  getProductById,getProductsByCategory 
} = require("../controllers/productController");



router.get("/getallproducts", getProducts);
router.post("/add", auth, upload.array("files"), addProduct);
router.put("/edit/:id", auth, upload.array("files"), editProduct);
router.delete("/delete/:id", auth, deleteProduct);
router.get('/category/:category', getProductsByCategory);

// LAST: Single product by ID
router.get("/:id", getProductById);


module.exports = router;
