// 📄 ui.js

// ================================
// 🔁 Chuyển tab trong giao diện admin
// ================================
export function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn"); // Nút chuyển tab
  const allSections = document.querySelectorAll("main .section"); // Các phần nội dung

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target; // ID section cần hiển thị

      // Bỏ active ở tất cả tab, thêm active cho tab được chọn
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Ẩn tất cả section, chỉ hiển thị section được chọn
      allSections.forEach((sec) => sec.classList.remove("active"));
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add("active");
    });
  });
}

// ================================
// 🔲 Đóng popup khi click ra ngoài
// ================================
export function setupPopup() {
  const popupOverlay = document.getElementById("editPopup");

  if (popupOverlay) {
    popupOverlay.addEventListener("click", (e) => {
      // Nếu click đúng vùng nền ngoài popup thì đóng popup
      if (e.target.id === "editPopup") window.closePopup();
    });
  }
}

// ================================
// ⏱️ Khi mới mở form: hiện sẵn form và thêm phần tử đầu tiên nếu chưa có
// ================================
export function setupInitialFormState() {
  const physicalFormContainer = document.getElementById(
    "physicalFormContainer"
  );
  const digitalFormContainer = document.getElementById("digitalFormContainer");
  const showPhysicalFormBtn = document.getElementById("showPhysicalForm");
  const showDigitalFormBtn = document.getElementById("showDigitalForm");
  const addVariantBtn = document.getElementById("addVariant");
  const addDurationBtn = document.getElementById("addDuration");

  // Khi click "Thêm sản phẩm vật lý" → hiện form và tự thêm dòng phân loại nếu chưa có
  showPhysicalFormBtn.addEventListener("click", () => {
    physicalFormContainer.style.display = "block";
    if (document.querySelectorAll("#variantList .variant-item").length === 0) {
      addVariantBtn.click();
    }
  });

  // Khi click "Thêm sản phẩm số" → hiện form và tự thêm option nếu chưa có
  showDigitalFormBtn.addEventListener("click", () => {
    digitalFormContainer.style.display = "block";
    if (document.querySelectorAll(".duration-block").length === 0) {
      addDurationBtn.click();
    }
  });
}

// ================================
// ➕ Thêm 1 dòng biến thể cho sản phẩm vật lý
// ================================
export function setupAddVariant() {
  const addVariantBtn = document.getElementById("addVariant");
  const variantList = document.getElementById("variantList");

  if (addVariantBtn && variantList) {
    addVariantBtn.addEventListener("click", () => {
      const div = document.createElement("div");
      div.classList.add("variant"); // Rất quan trọng, JS khác dùng class này để xử lý dữ liệu

      div.innerHTML = `
        <input type="text" class="variant-size" placeholder="Size" />
        <input type="number" class="variant-price" placeholder="Giá" />
        <input type="file" class="variant-image" accept="image/*" />
        <button type="button" onclick="this.parentElement.remove()">❌</button>
      `;

      variantList.appendChild(div);
    });
  }
}
