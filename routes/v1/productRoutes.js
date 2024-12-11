const express = require("express");
const router = express.Router();
const ProductController = require("../../controllers/productController");

router.post("/", ProductController.createProduct); // Create a product
router.get("/", ProductController.getProducts); // Get all products
router.get("/:id", ProductController.getProductById); // Get a product by ID
router.put("/:id", ProductController.updateProduct); // Update a product by ID
router.delete("/:id", ProductController.deleteProduct); // Delete a product by ID

module.exports = router;
