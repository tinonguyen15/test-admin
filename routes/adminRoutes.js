const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const productController = require("../controllers/productController");

// Thiết lập nơi lưu và tên file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Nơi lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// --- ROUTES ---

// Thêm sản phẩm (upload ảnh)
router.post(
  "/add-product",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "variantImages" }, // (mảng ảnh) mỗi ảnh tương ứng 1 size
  ]),
  productController.addProduct
);

// Lấy danh sách sản phẩm
router.get("/products", productController.getAllProducts);

// ✅ Lấy chi tiết 1 sản phẩm
router.get("/products/:id", productController.getProductById);

// Xóa sản phẩm + xóa ảnh
router.delete("/delete/:id", productController.deleteProduct);

// Sửa sản phẩm
router.put(
  "/update/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "variantImages" }, // ảnh theo size nếu có
  ]),
  productController.updateProduct
);

module.exports = router;
