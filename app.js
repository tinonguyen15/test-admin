// app.js
const express = require("express");
const path = require("path");
const app = express();
const productRoutes = require("./routes/productRoutes");

require("./db");

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/products", productRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/admin", adminRoutes);

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

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Server chạy tại http://localhost:${PORT}`)
);
