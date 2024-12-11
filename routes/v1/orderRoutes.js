const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/orderController");

// สร้างออร์เดอร์
router.post("/", orderController.createOrder);

// อ่านออร์เดอร์ทั้งหมด
router.get("/", orderController.getAllOrders);

// อ่านออร์เดอร์ทั้งหมดของ user คนหนึ่ง
router.get("/user/:userId", orderController.getOrdersByUser);

// อ่านออร์เดอร์ตามเลข Order ID
router.get("/:orderId", orderController.getOrderById);

// อัปเดตออร์เดอร์
router.put("/:orderId", orderController.updateOrder);

// ลบออร์เดอร์
router.delete("/:orderId", orderController.deleteOrder);

module.exports = router;
