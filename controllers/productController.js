const Product = require("../schemas/v1/product");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json({ status: "success", data: savedProduct });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// Read all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: "success", data: products });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Read a single product by ID
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

// Update a product
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

// Delete a product
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
