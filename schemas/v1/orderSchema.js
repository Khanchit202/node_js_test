const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // เชื่อมกับผู้ใช้
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 }, // จำนวนสินค้าที่สั่งซื้อ
      },
    ],
    totalPrice: { type: Number, required: true }, // ราคารวมทั้งหมด
    orderStatus: { type: String, default: "Pending" }, // สถานะของ Order
    createdAt: { type: Date, default: Date.now }, // วันที่สร้าง
    updatedAt: { type: Date, default: Date.now }, // วันที่อัปเดตล่าสุด
  },
  { timestamps: true } // เปิดใช้ timestamps (createdAt และ updatedAt)
);

module.exports = mongoose.model("Order", orderSchema);
