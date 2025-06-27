// 📄 ui.js

export function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const allSections = document.querySelectorAll("main .section");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;

      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      allSections.forEach((sec) => sec.classList.remove("active"));
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add("active");
    });
  });
}

export function setupPopup() {
  // Không ghi đè window.closePopup ở đây, chỉ gắn listener overlay
  const popupOverlay = document.getElementById("editPopup");
  if (popupOverlay) {
    popupOverlay.addEventListener("click", (e) => {
      if (e.target.id === "editPopup") window.closePopup();
    });
  }
}

// ✅ Tự động hiển thị form và thêm phần tử đầu tiên nếu chưa có
export function setupInitialFormState() {
  const physicalFormContainer = document.getElementById(
    "physicalFormContainer"
  );
  const digitalFormContainer = document.getElementById("digitalFormContainer");
  const showPhysicalFormBtn = document.getElementById("showPhysicalForm");
  const showDigitalFormBtn = document.getElementById("showDigitalForm");
  const addVariantBtn = document.getElementById("addVariant");
  const addDurationBtn = document.getElementById("addDuration");

  showPhysicalFormBtn.addEventListener("click", () => {
    physicalFormContainer.style.display = "block";
    if (document.querySelectorAll("#variantList .variant-item").length === 0) {
      addVariantBtn.click();
    }
  });

  showDigitalFormBtn.addEventListener("click", () => {
    digitalFormContainer.style.display = "block";
    if (document.querySelectorAll(".duration-block").length === 0) {
      addDurationBtn.click();
    }
  });
}
export function setupAddVariant() {
  const addVariantBtn = document.getElementById("addVariant");
  const variantList = document.getElementById("variantList");

  if (addVariantBtn && variantList) {
    addVariantBtn.addEventListener("click", () => {
      const div = document.createElement("div");
      div.classList.add("variant"); // rất quan trọng để formHandlers lấy dữ liệu
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
