// ====================
// Biến toàn cục
// ====================
const STATUS_LABELS = {
  "con-hang": "Đang bán",
  "het-hang": "Hết hàng",
  "sap-ra-mat": "Sắp ra mắt",
};
// ====================
// Quản lý giao diện và tab
// ====================
document.addEventListener("DOMContentLoaded", () => {
  const addVariantBtn = document.getElementById("addVariant");
  if (addVariantBtn) addVariantBtn.addEventListener("click", addVariant);

  const addDurationBtn = document.getElementById("addDuration");
  if (addDurationBtn) addDurationBtn.addEventListener("click", addDuration);

  const physicalForm = document.getElementById("physical-form");
  const digitalForm = document.getElementById("digital-form");
  const physicalFormContainer = document.getElementById(
    "physicalFormContainer"
  );
  const digitalFormContainer = document.getElementById("digitalFormContainer");
  const showPhysicalFormBtn = document.getElementById("showPhysicalForm");
  const showDigitalFormBtn = document.getElementById("showDigitalForm");
  const variantList = document.getElementById("variantList");
  const durationList = document.getElementById("durationList");

  let typeChartInstance, statusChartInstance;
  const typeChartCanvas = document.getElementById("typeChartCanvas");
  const statusChartCanvas = document.getElementById("statusChartCanvas");

  let currentEditingId = null;
  let currentEditingProduct = null;

  // Xử lý hiển thị form sản phẩm thường và tự thêm một phân loại
  showPhysicalFormBtn.addEventListener("click", () => {
    const isVisible = physicalFormContainer.style.display === "block";
    physicalFormContainer.style.display = isVisible ? "none" : "block";
    showPhysicalFormBtn.textContent = isVisible ? "Thêm sản phẩm" : "Ẩn";
    showPhysicalFormBtn.classList.toggle("active", !isVisible);

    if (!isVisible) {
      variantList.innerHTML = "";
      addVariant();
    }
  });

  // Xử lý hiển thị form sản phẩm mở rộng và tự thêm một option với 2 phân nhánh
  showDigitalFormBtn.addEventListener("click", () => {
    const isVisible = digitalFormContainer.style.display === "block";
    digitalFormContainer.style.display = isVisible ? "none" : "block";
    showDigitalFormBtn.textContent = isVisible ? "Thêm sản phẩm" : "Ẩn";
    showDigitalFormBtn.classList.toggle("active", !isVisible);

    if (!isVisible) {
      durationList.innerHTML = "";
      const durationDiv = document.createElement("div");
      durationDiv.classList.add("duration-block");
      durationDiv.innerHTML = `
        <input type="text" class="plan-duration" placeholder="Thời hạn (VD: 3 tháng)" required />
        <div class="option-list"></div>
        <button type="button" onclick="addOption(this)">+ Thêm phân nhánh</button>
        <button type="button" onclick="this.parentElement.remove()">Xóa Option</button>
      `;
      durationList.appendChild(durationDiv);
      const optionList = durationDiv.querySelector(".option-list");
      for (let i = 0; i < 2; i++) {
        const optDiv = document.createElement("div");
        optDiv.innerHTML = `
          <input type="text" class="plan-device" placeholder="Thiết bị" required />
          <input type="number" class="plan-price" placeholder="Giá" required />
          <button type="button" onclick="this.parentElement.remove()">Xóa</button>
        `;
        optionList.appendChild(optDiv);
      }
    }
  });

  // Hàm thêm phân loại cho sản phẩm thường
  window.addVariant = () => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="text" class="variant-size" placeholder="Size" />
      <input type="number" class="variant-price" placeholder="Giá" required />
      <button type="button" onclick="this.parentElement.remove()">Xóa</button>
    `;
    variantList.appendChild(div);
  };

  // Hàm thêm option cho sản phẩm mở rộng
  window.addOption = (btn) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="text" class="plan-device" placeholder="Thiết bị" required />
      <input type="number" class="plan-price" placeholder="Giá" required />
      <button type="button" onclick="this.parentElement.remove()">Xóa</button>
    `;
    btn.previousElementSibling.appendChild(div);
  };

  // ====================
  // Xử lý chuyển tab
  // ====================
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

  // ====================
  // Giao diện thêm biến thể cho chỉnh sửa sản phẩm
  // ====================
  window.createVariantRow = (size = "", price = "") => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="text" class="edit-variant-size" value="${size}" placeholder="Size"/>
      <input type="number" class="edit-variant-price" value="${price}" placeholder="Giá"/>
      <button type="button" onclick="this.parentElement.remove()">❌</button>
    `;
    return div;
  };

  const addEditVariantBtn = document.getElementById("addEditVariant");
  if (addEditVariantBtn) {
    addEditVariantBtn.addEventListener("click", () => {
      const container = document.getElementById("editVariantList");
      if (container) container.appendChild(createVariantRow());
    });
  }

  // ====================
  // Load & hiển thị sản phẩm
  // ====================

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    if (!res.ok) return alert("Không thể tải sản phẩm.");
    const products = await res.json();
    products.sort((a, b) => a.stt - b.stt);

    physicalTableBody.innerHTML = "";
    digitalTableBody.innerHTML = "";

    let counts = {
      physical: 0,
      digital: 0,
      "con-hang": 0,
      "het-hang": 0,
      "sap-ra-mat": 0,
    };

    products.forEach((p) => {
      const row = document.createElement("tr");
      row.dataset.id = p._id;

      const priceDisplay =
        p.type === "physical"
          ? p.variants?.length === 1 &&
            (!p.variants[0].size || p.variants[0].size.trim() === "")
            ? `Giá: ${Number(p.variants[0].price).toLocaleString()} ₫`
            : (p.variants || [])
                .map((v) => {
                  const price = Number(v.price);
                  const display = Number.isFinite(price)
                    ? price.toLocaleString() + " ₫"
                    : "Chưa có giá";
                  return `${v.size}: ${display}`;
                })
                .join("<br>")
          : (p.plans || [])
              .map(
                (plan) =>
                  `<strong>${plan.duration}</strong><br>` +
                  plan.options
                    .map((opt) => {
                      const price = Number(opt.price);
                      const display = Number.isFinite(price)
                        ? price.toLocaleString() + " ₫"
                        : "Chưa có giá";
                      return `- ${opt.device}: ${display}`;
                    })
                    .join("<br>")
              )
              .join("<hr>") || "Chưa có giá";

      row.innerHTML = `
  <td>${p.stt}</td>
  <td>${p.name}</td>
  <td class="price">${priceDisplay}</td>
  <td><img src="/${p.image}" width="50" /></td>
  <td>${STATUS_LABELS[p.status] || "Không rõ"}</td>
  <td>
    <button class="editBtn">Sửa</button>
    <button class="deleteBtn">Xoá</button>
  </td>
`;

      if (p.type === "physical") {
        physicalTableBody.appendChild(row);
        counts.physical++;
      } else {
        digitalTableBody.appendChild(row);
        counts.digital++;
      }

      if (counts[p.status] !== undefined) counts[p.status]++;
    });

    renderTypeChart(counts);
    renderStatusChart(counts);
  }

  // ====================
  // Biểu đồ thống kê sản phẩm
  // ====================
  function renderTypeChart(counts) {
    if (!typeChartCanvas) return;
    const ctx = typeChartCanvas.getContext("2d");
    if (typeChartInstance) typeChartInstance.destroy();
    typeChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Thường", "Mở rộng"],
        datasets: [
          {
            label: "Số lượng",
            data: [counts.physical || 0, counts.digital || 0],
            backgroundColor: ["#4caf50", "#2196f3"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            bottom: 10,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  function renderStatusChart(counts) {
    if (!statusChartCanvas) return;
    const ctx = statusChartCanvas.getContext("2d");
    if (statusChartInstance) statusChartInstance.destroy();
    statusChartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Đang bán", "Hết hàng", "Sắp ra mắt"],
        datasets: [
          {
            label: "Số lượng",
            data: [
              counts["con-hang"] || 0,
              counts["het-hang"] || 0,
              counts["sap-ra-mat"] || 0,
            ],
            backgroundColor: ["#8bc34a", "#f44336", "#ff9800"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  // ====================
  // Thêm sản phẩm vật lý & số
  // ====================
  physicalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(physicalForm);
    formData.append("type", "physical");

    const allVariants = [...document.querySelectorAll("#variantList div")].map(
      (div) => ({
        size: div.querySelector(".variant-size").value.trim(),
        price: parseInt(div.querySelector(".variant-price").value.trim()),
      })
    );

    const variants = allVariants.filter((v) => !isNaN(v.price));

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

    alert("✅ " + result.message);
    physicalForm.reset();
    document.getElementById("variantList").innerHTML = "";
    loadProducts();
  });

  digitalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(digitalForm);
    formData.append("type", "digital");

    const plans = [...document.querySelectorAll(".duration-block")].map(
      (block) => {
        const duration = block.querySelector(".plan-duration").value;
        const options = [...block.querySelectorAll(".option-list div")].map(
          (opt) => ({
            device: opt.querySelector(".plan-device").value,
            price: parseInt(opt.querySelector(".plan-price").value),
          })
        );
        return { duration, options };
      }
    );

    formData.append("plans", JSON.stringify(plans));
    await fetch("/api/admin/add-product", { method: "POST", body: formData });
    digitalForm.reset();
    document.getElementById("durationList").innerHTML = "";
    loadProducts();
  });

  // ====================
  // Giao diện thêm Size & Options
  // ====================
  window.addVariant = () => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="text" class="variant-size" placeholder="Size"/>
      <input type="number" class="variant-price" placeholder="Giá" required />
      <button type="button" onclick="this.parentElement.remove()">Xóa</button>
    `;
    document.getElementById("variantList").appendChild(div);
  };

  window.addDuration = () => {
    const durationDiv = document.createElement("div");
    durationDiv.classList.add("duration-block");
    durationDiv.innerHTML = `
      <input type="text" class="plan-duration" placeholder="Thời hạn (VD: 3 tháng)" required />
      <div class="option-list"></div>
      <button type="button" onclick="addOption(this)">+ Thêm phân nhánh</button>
      <button type="button" onclick="this.parentElement.remove()">Xóa Option</button>
    `;
    document.getElementById("durationList").appendChild(durationDiv);
  };

  window.addOption = (btn) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="text" class="plan-device" placeholder="Thiết bị" required />
      <input type="number" class="plan-price" placeholder="Giá" required />
      <button type="button" onclick="this.parentElement.remove()">Xóa</button>
    `;
    btn.previousElementSibling.appendChild(div);
  };

  // ====================
  // Popup sửa sản phẩm
  // ====================
  window.closePopup = () => {
    document.getElementById("editPopup").style.display = "none";
  };

  document.getElementById("editPopup").addEventListener("click", (e) => {
    if (e.target.id === "editPopup") closePopup();
  });

  // Lưu chỉnh sửa
  window.saveEdit = async () => {
    const name = document.getElementById("editName").value.trim();
    const stt = document.getElementById("editStt").value.trim();
    const status = document.getElementById("editStatus").value;
    const image = document.getElementById("editImage").files[0];

    if (!name || !stt) {
      alert("⚠️ Vui lòng nhập đầy đủ tên và STT.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("stt", stt);
    formData.append("status", status);
    if (image) formData.append("image", image);

    const inputError = (message, inputEl) => {
      let errorEl = inputEl.nextElementSibling;
      if (!errorEl || !errorEl.classList.contains("price-error")) {
        errorEl = document.createElement("div");
        errorEl.className = "price-error";
        errorEl.style.color = "red";
        errorEl.style.fontSize = "12px";
        errorEl.style.marginTop = "4px";
        inputEl.insertAdjacentElement("afterend", errorEl);
      }
      errorEl.textContent = message;
      inputEl.focus();
    };

    document.querySelectorAll(".price-error").forEach((el) => el.remove());

    if (currentEditingProduct.type === "physical") {
      const sizeInputs = document.querySelectorAll(".edit-variant-size");
      const priceInputs = document.querySelectorAll(".edit-variant-price");
      const variants = [];

      for (let i = 0; i < priceInputs.length; i++) {
        const size = sizeInputs[i].value.trim();
        const priceStr = priceInputs[i].value.trim();

        if (!priceStr) continue;

        if (!/^[0-9]+$/.test(priceStr)) {
          inputError("Chỉ được nhập số dương", priceInputs[i]);
          return;
        }

        if (priceStr.length > 10) {
          inputError("Tối đa 10 chữ số", priceInputs[i]);
          return;
        }

        const price = parseInt(priceStr);
        variants.push({ size, price });
      }

      if (variants.length === 0) {
        alert("⚠️ Cần nhập ít nhất một biến thể sản phẩm.");
        return;
      }

      if (variants.length > 1) {
        const hasEmptySize = variants.some((v) => !v.size.trim());
        if (hasEmptySize) {
          alert("⚠️ Khi có nhiều biến thể, mỗi dòng giá phải có size.");
          return;
        }
      }

      formData.append("variants", JSON.stringify(variants));
      formData.append("type", "physical");
    } else {
      const planBlocks = document.querySelectorAll(".plan-block");
      const plans = [];

      for (let block of planBlocks) {
        const duration = block
          .querySelector(".edit-plan-duration")
          .value.trim();
        const deviceInputs = block.querySelectorAll(".edit-plan-device");
        const priceInputs = block.querySelectorAll(".edit-plan-price");

        const options = [];
        for (let i = 0; i < deviceInputs.length; i++) {
          const device = deviceInputs[i].value.trim();
          const priceStr = priceInputs[i].value.trim();

          if (!device) {
            inputError("Thiết bị không được để trống", deviceInputs[i]);
            return;
          }

          if (!priceStr) {
            inputError("Giá không được để trống", priceInputs[i]);
            return;
          }

          if (!/^[0-9]+$/.test(priceStr)) {
            inputError("Chỉ được nhập số dương", priceInputs[i]);
            return;
          }

          if (priceStr.length > 10) {
            inputError("Tối đa 10 chữ số", priceInputs[i]);
            return;
          }

          const price = parseInt(priceStr);
          options.push({ device, price });
        }

        if (!duration || options.length === 0) {
          alert("⚠️ Mỗi gói phải có thời hạn và ít nhất một thiết bị.");
          return;
        }

        plans.push({ duration, options });
      }

      if (plans.length === 0) {
        alert("⚠️ Cần nhập ít nhất một gói dịch vụ.");
        return;
      }

      formData.append("plans", JSON.stringify(plans));
      formData.append("type", "digital");
    }

    const res = await fetch(`/api/admin/update/${currentEditingId}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      closePopup();
      loadProducts();
    } else {
      alert("❌ Có lỗi xảy ra khi cập nhật sản phẩm.");
    }
  };

  // ====================
  // Xử lý nút Sửa / Xoá
  // ====================
  document.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const id = row?.dataset?.id;
    if (!id) return;

    // XÓA SẢN PHẨM
    if (e.target.classList.contains("deleteBtn")) {
      if (confirm("Bạn chắc chắn muốn xoá?")) {
        await fetch(`/api/admin/delete/${id}`, { method: "DELETE" });
        loadProducts();
      }
    }

    // SỬA SẢN PHẨM
    if (e.target.classList.contains("editBtn")) {
      const res = await fetch(`/api/admin/products/${id}`);
      const product = await res.json();

      currentEditingId = id;
      currentEditingProduct = product;

      // Gán dữ liệu chung
      document.getElementById("editName").value = product.name;
      document.getElementById("editStt").value = product.stt;
      document.getElementById("editStatus").value =
        product.status || "con-hang";
      document.getElementById("editImage").value = "";

      const optionsArea = document.getElementById("editOptions");
      optionsArea.innerHTML = "";

      // Sản phẩm thường
      if (product.type === "physical") {
        optionsArea.innerHTML = `
        <label>Phân loại:</label>
        <div id="editVariantList" class="space-y-2"></div>
        <button id="addEditVariant" type="button">➕ Thêm phân loại</button>
      `;

        const variantList = document.getElementById("editVariantList");
        product.variants?.forEach((v) => {
          const div = document.createElement("div");
          div.innerHTML = `
          <input type="text" class="edit-variant-size" value="${v.size}" placeholder="Size" />
          <input type="number" class="edit-variant-price" value="${v.price}" placeholder="Giá" />
          <button type="button" onclick="this.parentElement.remove()">Xoá</button>
        `;
          variantList.appendChild(div);
        });

        // Gán nút thêm phân loại
        document
          .getElementById("addEditVariant")
          .addEventListener("click", () => {
            const div = document.createElement("div");
            div.innerHTML = `
          <input type="text" class="edit-variant-size" placeholder="Size" />
          <input type="number" class="edit-variant-price" placeholder="Giá" />
          <button type="button" onclick="this.parentElement.remove()">Xoá</button>
        `;
            document.getElementById("editVariantList").appendChild(div);
          });
      }

      // Sản phẩm mở rộng
      else {
        optionsArea.innerHTML = `
        <label>Phân loại nhị cấp:</label>
        <div id="editPlanList"></div>
        <button id="addEditPlan" type="button">➕ Thêm Options</button>
      `;

        const planList = document.getElementById("editPlanList");

        const createOptionDiv = (device = "", price = "") => {
          const optDiv = document.createElement("div");
          optDiv.innerHTML = `
          <input type="text" class="edit-plan-device" value="${device}" placeholder="Thiết bị" />
          <input type="number" class="edit-plan-price" value="${price}" placeholder="Giá" />
          <button type="button" onclick="this.parentElement.remove()">Xoá</button>
        `;
          return optDiv;
        };

        const createPlanBlock = (plan = { duration: "", options: [] }) => {
          const wrapper = document.createElement("div");

          const block = document.createElement("div");
          block.className = "plan-block";
          block.innerHTML = `
          <input type="text" class="edit-plan-duration" value="${plan.duration}" placeholder="Thời hạn (VD: 3 tháng)" />
          <div class="option-list"></div>
          <button type="button" class="add-option-btn">+ Thêm phân nhánh</button>
          <button type="button" class="remove-duration-btn">Xoá Option</button>
        `;

          const optionList = block.querySelector(".option-list");
          plan.options?.forEach((opt) => {
            optionList.appendChild(createOptionDiv(opt.device, opt.price));
          });

          block
            .querySelector(".add-option-btn")
            .addEventListener("click", () => {
              optionList.appendChild(createOptionDiv());
            });

          block
            .querySelector(".remove-duration-btn")
            .addEventListener("click", () => {
              wrapper.remove();
            });

          wrapper.appendChild(block);
          wrapper.appendChild(document.createElement("hr"));
          return wrapper;
        };

        product.plans?.forEach((plan) => {
          planList.appendChild(createPlanBlock(plan));
        });

        document.getElementById("addEditPlan").addEventListener("click", () => {
          planList.appendChild(createPlanBlock());
        });
      }

      // Hiển thị popup
      document.getElementById("editPopup").classList.add("show");
    }
  });

  // Load lần đầu
  loadProducts();
});
