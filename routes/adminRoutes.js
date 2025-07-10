// 📄 adminRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middlewares/upload"); // ✅ Dùng file upload.js chuẩn

// --- ROUTES ---

// Thêm sản phẩm (upload ảnh)
router.post(
  "/add-product",
  upload.fields([{ name: "image", maxCount: 1 }, { name: "variantImages" }]),
  productController.addProduct
);

// Lấy danh sách sản phẩm
router.get("/products", productController.getAllProducts);

// Lấy chi tiết sản phẩm
router.get("/products/:id", productController.getProductById);

// Xoá sản phẩm
router.delete("/delete/:id", productController.deleteProduct);

// Sửa sản phẩm
router.put(
  "/update/:id",
  upload.fields([{ name: "image", maxCount: 1 }, { name: "variantImages" }]),
  productController.updateProduct
);

module.exports = router;
