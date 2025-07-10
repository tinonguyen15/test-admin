// 📄 plans.js
export function addOption(btn) {
  const div = document.createElement("div");
  div.innerHTML = `
    <input type="text" class="plan-device" placeholder="Thiết bị" required />
    <input type="number" class="plan-price" placeholder="Giá" required />
    <button type="button" onclick="this.parentElement.remove()">Xóa</button>
  `;
  btn.previousElementSibling.appendChild(div);
}

export function addDuration() {
  const durationDiv = document.createElement("div");
  durationDiv.classList.add("duration-block");
  durationDiv.innerHTML = `
    <input type="text" class="plan-duration" placeholder="Option 1" required />
    <div class="option-list"></div>
    <button type="button" class="addOptionBtn">+ Thêm phân nhánh</button>
    <button type="button" class="removeDurationBtn">Xóa Option</button>
  `;
  document.getElementById("durationList").appendChild(durationDiv);

  const optionList = durationDiv.querySelector(".option-list");
  for (let i = 0; i < 2; i++) {
    const optDiv = document.createElement("div");
    optDiv.innerHTML = `
      <input type="text" class="plan-device" placeholder="Option 2" required />
      <input type="number" class="plan-price" placeholder="Giá" required />
      <button type="button" onclick="this.parentElement.remove()">Xóa</button>
    `;
    optionList.appendChild(optDiv);
  }

  durationDiv.querySelector(".addOptionBtn").addEventListener("click", () => {
    addOption({ previousElementSibling: optionList });
  });

  durationDiv
    .querySelector(".removeDurationBtn")
    .addEventListener("click", () => {
      durationDiv.remove();
    });
}

export function setupAddDuration() {
  const addBtn = document.getElementById("addDuration");
  if (addBtn) {
    addBtn.addEventListener("click", addDuration);
  }

  const showDigitalFormBtn = document.getElementById("showDigitalForm");
  const container = document.getElementById("digitalFormContainer");

  if (showDigitalFormBtn && container) {
    showDigitalFormBtn.addEventListener("click", () => {
      const isVisible = container.style.display === "block";
      container.style.display = isVisible ? "none" : "block";
      showDigitalFormBtn.textContent = isVisible ? "Thêm sản phẩm" : "Ẩn";
      showDigitalFormBtn.classList.toggle("active", !isVisible);

      if (!isVisible) {
        document.getElementById("durationList").innerHTML = "";
        addDuration(); // tự động thêm 1 block
      }
    });
  }
}
