const Product = require("../schemas/v1/product");

// สร้างสินค้าใหม่
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json({ status: "success", data: savedProduct });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// อ่านสินค้าทั้งหมด
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: "success", data: products });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// อ่านสินค้าตาม ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// อัปเดตสินค้า
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    res.status(200).json({ status: "success", data: updatedProduct });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// ลบสินค้า
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    res.status(200).json({ status: "success", message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
