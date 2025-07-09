const SiteConfig = require("../../models/SiteConfig");
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

    // Xóa file cũ nếu có
    if (logo) {
      if (config.logo && fs.existsSync(config.logo)) {
        fs.unlinkSync(config.logo);
      }
      config.logo = logo.path;
    }

    if (banner) {
      if (config.banner && fs.existsSync(config.banner)) {
        fs.unlinkSync(config.banner);
      }
      config.banner = banner.path;
    }

    config.hotline = hotline;
    config.socialLinks = { facebook, tiktok };

    await config.save();
    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật cấu hình:", err);
    res.status(500).json({ error: "Cập nhật thất bại." });
  }
};
