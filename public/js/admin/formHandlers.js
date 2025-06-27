// 📄 formHandlers.js
import { loadProducts } from "./render.js";

export function setupFormToggles() {
  const physicalForm = document.getElementById("physical-form");
  const digitalForm = document.getElementById("digital-form");

  // ================== PHYSICAL ===================
  physicalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(physicalForm);
    formData.append("type", "physical");

    const allVariants = [...document.querySelectorAll("#variantList .variant")];

    const variants = [];

    allVariants.forEach((div, index) => {
      const size = div.querySelector(".variant-size")?.value.trim();
      const price = parseInt(div.querySelector(".variant-price")?.value.trim());
      const imageInput = div.querySelector(".variant-image");
      const imageFile = imageInput?.files[0];

      if (!size || isNaN(price)) return; // bỏ qua nếu thiếu thông tin

      const variant = { size, price };
      variants.push(variant);

      // Thêm ảnh nếu có
      if (imageFile) {
        formData.append(`variantImages`, imageFile); // tên field chung
        formData.append(`variantImageIndexes`, index); // đánh dấu vị trí
      }
    });

    formData.append("variants", JSON.stringify(variants));

    const res = await fetch("/api/admin/add-product", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
      alert("❌ " + (result.error || "Lỗi không xác định"));
      return;
    }

    alert(result.message);
    physicalForm.reset();
    document.getElementById("variantList").innerHTML = "";
    document.getElementById("addVariant").click();

    loadProducts();
  });

  // ================== DIGITAL ===================
  digitalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(digitalForm);
    formData.append("type", "digital");

    const plans = [...document.querySelectorAll(".duration-block")].map(
      (block) => {
        const duration = block.querySelector(".plan-duration").value.trim();
        const options = [...block.querySelectorAll(".option-list div")].map(
          (opt) => ({
            device: opt.querySelector(".plan-device").value.trim(),
            price: parseInt(opt.querySelector(".plan-price").value),
          })
        );
        return { duration, options };
      }
    );

    formData.append("plans", JSON.stringify(plans));

    const res = await fetch("/api/admin/add-product", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
      alert("❌ " + (result.error || "Lỗi không xác định"));
      return;
    }

    alert(result.message);
    digitalForm.reset();
    document.getElementById("durationList").innerHTML = "";
    document.getElementById("addDuration").click();

    loadProducts();
  });
}
