// public/js/renderSiteConfig.js

export function renderSiteConfig(config) {
  if (!config) return;

  const logoImg = document.getElementById("logoImg");
  if (logoImg && config.logo) {
    logoImg.src = "/" + config.logo.replace("public/", "");
  }

  const bannerImg = document.getElementById("bannerImg");
  if (bannerImg && config.banner) {
    bannerImg.src = "/" + config.banner.replace("public/", "");
  }

  const hotlineText = document.getElementById("hotlineText");
  if (hotlineText && config.hotline) {
    hotlineText.textContent = "📞Tư vấn: " + config.hotline;
  }

  const fbLink = document.getElementById("facebookLink");
  if (fbLink && config.socialLinks?.facebook) {
    fbLink.href = config.socialLinks.facebook;
  }

  const tiktokLink = document.getElementById("tiktokLink");
  if (tiktokLink && config.socialLinks?.tiktok) {
    tiktokLink.href = config.socialLinks.tiktok;
  }
}
