const express = require("express");
const router = express.Router();
const siteConfigController = require("../controllers/siteConfigController");
const multer = require("multer");
const path = require("path");

// Cấu hình Multer lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get("/", siteConfigController.getConfig);

router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  siteConfigController.updateConfig
);

module.exports = router;
