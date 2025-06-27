const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// API: GET /api/products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
  }
});

module.exports = router;
