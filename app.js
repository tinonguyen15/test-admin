const express = require("express");
const path = require("path");
const app = express();
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const siteConfigRoutes = require("./routes/siteConfigRoutes"); // render giao diện

require("./db");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public/images"))); // render giao diện

// API routes
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/site-config", siteConfigRoutes); // render giao diện

// Giao diện người dùng
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "index.html"))
);
app.get("/admin", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "admin.html"))
);

// 404 fallback
app.use((req, res) =>
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"))
);

// Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Server chạy tại http://localhost:${PORT}`)
);
