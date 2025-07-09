// 📄 public/js/admin/siteConfig.js

export function setupSiteConfigForm() {
  const form = document.getElementById("configForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/site-config", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      alert(result.message || "Cập nhật thành công!");
    } catch (err) {
      console.error("❌ Lỗi cập nhật site config:", err);
      alert("Có lỗi xảy ra khi cập nhật cấu hình!");
    }
  });

  // Load config hiện tại vào form
  fetch("/api/site-config")
    .then((res) => res.json())
    .then((data) => {
      if (data?.hotline) form.hotline.value = data.hotline;
      if (data?.socialLinks?.facebook)
        form.facebook.value = data.socialLinks.facebook;
      if (data?.socialLinks?.tiktok)
        form.tiktok.value = data.socialLinks.tiktok;
    });
}
