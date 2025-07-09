const mongoose = require("mongoose");

const siteConfigSchema = new mongoose.Schema({
  logo: String,
  banner: String,
  hotline: String,
  socialLinks: {
    facebook: String,
    tiktok: String,
  },
});

module.exports = mongoose.model("SiteConfig", siteConfigSchema);
