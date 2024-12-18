const mongoose = require("mongoose");

// สร้าง Schema สำหรับสินค้า
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // ชื่อสินค้า (ต้องระบุ)
    description: { type: String }, // รายละเอียดสินค้า
    price: { type: Number, required: true, min: 0 }, // ราคาสินค้า (ต้องระบุและต้องไม่ต่ำกว่า 0)
    stock: { type: Number, required: true, min: 0 }, // จำนวนสินค้าในสต็อก (ต้องระบุและต้องไม่ต่ำกว่า 0)
    category: { type: String }, // หมวดหมู่สินค้า
  },
  { timestamps: true } // เพิ่มฟิลด์ createdAt และ updatedAt อัตโนมัติ
);

module.exports = mongoose.model("Product", productSchema);
