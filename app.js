// app.js
const express = require("express");
const path = require("path");
const app = express();

// Kết nối MongoDB
require("./db");

// Route imports
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const siteConfigRoutes = require("./routes/siteConfigRoutes");

// Middleware đọc dữ liệu form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Static files =====
// Truy cập các file tĩnh trong thư mục /public
app.use(express.static(path.join(__dirname, "public")));

// Truy cập ảnh từ đường dẫn:
app.use("/uploads", express.static(path.join(__dirname, "public/uploads"))); // ảnh sản phẩm
app.use("/images", express.static(path.join(__dirname, "public/images"))); // ảnh mặc định, hoặc cũ
app.use("/logos", express.static(path.join(__dirname, "public/uploads"))); // nếu bạn dùng chung uploads

// ===== API routes =====
app.use("/api/products", productRoutes); // người dùng frontend
app.use("/api/admin", adminRoutes); // CRUD quản trị
app.use("/api/site-config", siteConfigRoutes); // logo, banner...

// ===== Giao diện người dùng =====
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "index.html"))
);

app.get("/admin", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "admin.html"))
);

// ===== 404 fallback =====
app.use((req, res) =>
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"))
);

// ===== Khởi động server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
