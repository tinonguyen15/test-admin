// 📄 public/js/admin/admin.js
import { setupTabs, setupPopup } from "./ui.js";
import { setupAddVariant } from "./variants.js";
import { setupAddDuration } from "./plans.js";
import { loadProducts } from "./render.js";
import { setupFormToggles } from "./formHandlers.js";
import { setupSiteConfigForm } from "./siteConfig.js";
import "./productActions.js";

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupPopup();
  setupFormToggles();
  setupAddVariant();
  setupAddDuration();
  loadProducts();
  setupSiteConfigForm(); // ✅ gọi khởi tạo form cấu hình
});
