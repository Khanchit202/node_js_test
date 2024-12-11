const Order = require("../schemas/v1/orderSchema");

// สร้างออร์เดอร์
exports.createOrder = async (req, res) => {
  try {
    const { user, products, totalPrice } = req.body;

    const newOrder = await Order.create({ user, products, totalPrice });
    res.status(201).json({ status: "success", data: newOrder });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// อ่านออร์เดอร์ทั้งหมด
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("products.product");
    res.status(200).json({ status: "success", data: orders });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// อ่านออร์เดอร์ทั้งหมดของ user คนหนึ่ง
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).populate("products.product");
    res.status(200).json({ status: "success", data: orders });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// อ่านออร์เดอร์ตามเลข Order ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("products.product");
    if (!order) return res.status(404).json({ status: "error", message: "Order not found" });
    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// อัปเดตออร์เดอร์
exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { products, totalPrice, orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { products, totalPrice, orderStatus, updatedAt: Date.now() },
      { new: true }
    ).populate("products.product");

    if (!updatedOrder) return res.status(404).json({ status: "error", message: "Order not found" });

    res.status(200).json({ status: "success", data: updatedOrder });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// ลบออร์เดอร์
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) return res.status(404).json({ status: "error", message: "Order not found" });

    res.status(200).json({ status: "success", message: "Order deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};
