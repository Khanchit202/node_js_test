const express = require("express");
const router = express.Router();
const ProductController = require("../../controllers/productController");

router.post("/", ProductController.createProduct); // สร้างสินค้าใหม่
router.get("/", ProductController.getProducts); // อ่านสินค้าทั้งหมด
router.get("/:id", ProductController.getProductById); // อ่านสินค้าตาม ID
router.put("/:id", ProductController.updateProduct); // อัปเดตสินค้าตาม ID
router.delete("/:id", ProductController.deleteProduct); // ลบสินค้าตาม ID

module.exports = router;
