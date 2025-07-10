// 📄 middlewares/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 Thư mục chứa ảnh upload
const uploadDir = path.join(__dirname, "../public/uploads");

// 🔧 Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 📛 Tạo tiền tố tên file dựa theo tên field
const getPrefix = (fieldname) => {
  switch (fieldname) {
    case "image":
      return "product"; // ảnh sản phẩm chính
    case "variantImages":
      return "variant"; // ảnh theo size (variant)
    case "logo":
      return "logo"; // logo website
    case "banner":
      return "banner"; // ảnh banner trang chủ
    default:
      return "file"; // fallback
  }
};

// 🎯 Bộ lọc kiểm tra định dạng ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && mime.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error("❌ Chỉ cho phép các định dạng ảnh: jpeg, jpg, png, gif, webp")
    );
  }
};

// 🗂️ Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = getPrefix(file.fieldname); // lấy prefix theo field
    const timestamp = Date.now();
    cb(null, `${prefix}-${timestamp}${ext}`);
  },
});

// 📦 Multer cấu hình chính
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn kích thước: 5MB
  },
});

module.exports = upload;
