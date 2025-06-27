// 📄 variants.js

// Thêm 1 dòng phân loại mới (size, giá, ảnh)
export function addVariant() {
  const div = document.createElement("div");
  div.className = "variant"; // dùng để nhận diện trong JS khác

  div.innerHTML = `
    <input type="text" class="variant-size" placeholder="Size" />
    <input type="number" class="variant-price" placeholder="Giá" required />
    <input type="file" class="variant-image" accept="image/*" />
    <button type="button" onclick="this.parentElement.remove()">❌</button>
  `;

  document.getElementById("variantList").appendChild(div);
}

// Cài đặt sự kiện nút "Thêm phân loại" và mở form thêm sản phẩm vật lý
export function setupAddVariant() {
  const addBtn = document.getElementById("addVariant");
  if (addBtn) {
    addBtn.addEventListener("click", addVariant);
  }

  const showPhysicalFormBtn = document.getElementById("showPhysicalForm");
  const container = document.getElementById("physicalFormContainer");

  if (showPhysicalFormBtn && container) {
    showPhysicalFormBtn.addEventListener("click", () => {
      const isVisible = container.style.display === "block";
      container.style.display = isVisible ? "none" : "block";
      showPhysicalFormBtn.textContent = isVisible ? "➕ Thêm sản phẩm" : "Ẩn";
      showPhysicalFormBtn.classList.toggle("active", !isVisible);

      if (!isVisible) {
        // Khi mở form: xóa các dòng cũ và thêm dòng đầu tiên
        document.getElementById("variantList").innerHTML = "";
        addVariant();
      }
    });
  }
}
