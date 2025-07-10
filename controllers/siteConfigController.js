// siteConfigController.js
const SiteConfig = require("../models/SiteConfig");
const fs = require("fs");
const path = require("path");

exports.getConfig = async (req, res) => {
  try {
    const config = await SiteConfig.findOne();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy cấu hình." });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { hotline, facebook, tiktok } = req.body;
    const logo = req.files?.logo?.[0];
    const banner = req.files?.banner?.[0];

    let config = await SiteConfig.findOne();
    if (!config) config = new SiteConfig();

    // ✅ Cập nhật logo (và xoá ảnh cũ nếu có)
    if (logo) {
      if (config.logo && fs.existsSync(path.join("public", config.logo))) {
        fs.unlinkSync(path.join("public", config.logo));
      }
      config.logo = `uploads/${logo.filename}`;
    }

    // ✅ Cập nhật banner (và xoá ảnh cũ nếu có)
    if (banner) {
      if (config.banner && fs.existsSync(path.join("public", config.banner))) {
        fs.unlinkSync(path.join("public", config.banner));
      }
      config.banner = `uploads/${banner.filename}`;
    }

    config.hotline = hotline || "";
    config.socialLinks = {
      facebook: facebook || "",
      tiktok: tiktok || "",
    };

    await config.save();
    res.json({ message: "✅ Cập nhật cấu hình thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật site config:", err);
    res.status(500).json({ error: "Lỗi khi cập nhật cấu hình." });
  }
};
