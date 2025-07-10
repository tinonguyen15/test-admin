// siteConfigRoutes.js
const express = require("express");
const router = express.Router();
const siteConfigController = require("../controllers/siteConfigController");
const upload = require("../middlewares/upload"); // ✅ dùng middleware chuẩn

// Lấy cấu hình site
router.get("/", siteConfigController.getConfig);

// Cập nhật cấu hình (logo + banner)
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  siteConfigController.updateConfig
);

module.exports = router;
