// 📄 productActions.js
import { loadProducts } from "./render.js";

let currentEditingId = null;
let currentEditingProduct = null;

window.closePopup = () => {
  document.getElementById("editPopup").classList.remove("show");
  currentEditingId = null;
  currentEditingProduct = null;
};

document.getElementById("editPopup").addEventListener("click", (e) => {
  if (e.target.id === "editPopup") closePopup();
});

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

  if (currentEditingProduct.type === "physical") {
    const sizeInputs = document.querySelectorAll(".edit-variant-size");
    const priceInputs = document.querySelectorAll(".edit-variant-price");
    const imageInputs = document.querySelectorAll(".edit-variant-image");

    const variants = [];
    const variantImageIndexes = [];
    for (let i = 0; i < sizeInputs.length; i++) {
      const size = sizeInputs[i].value.trim();
      const priceStr = priceInputs[i].value.trim();
      const imgInput = imageInputs[i];

      if (!priceStr || isNaN(priceStr)) {
        alert("⚠️ Giá phải là số dương.");
        priceInputs[i].focus();
        return;
      }

      const variant = { size, price: parseInt(priceStr) };

      if (imgInput?.files?.length) {
        formData.append("variantImages", imgInput.files[0]); // push ảnh
        variantImageIndexes.push(i); // ghi nhận index
      }

      variants.push(variant);
    }

    if (variants.length === 0) {
      alert("⚠️ Cần ít nhất một biến thể sản phẩm.");
      return;
    }

    formData.append("variants", JSON.stringify(variants));
    formData.append("variantImageIndexes", JSON.stringify(variantImageIndexes));
    formData.append("type", "physical");
  } else {
    // sản phẩm digital
    const planBlocks = document.querySelectorAll(".plan-block");
    const plans = [];

    for (let block of planBlocks) {
      const duration = block.querySelector(".edit-plan-duration").value.trim();
      const deviceInputs = block.querySelectorAll(".edit-plan-device");
      const priceInputs = block.querySelectorAll(".edit-plan-price");

      const options = [];
      for (let i = 0; i < deviceInputs.length; i++) {
        const device = deviceInputs[i].value.trim();
        const priceStr = priceInputs[i].value.trim();
        if (!device || !priceStr || isNaN(priceStr)) {
          alert("⚠️ Thiết bị và giá không hợp lệ.");
          return;
        }
        options.push({ device, price: parseInt(priceStr) });
      }

      if (!duration || options.length === 0) {
        alert("⚠️ Mỗi gói phải có thời hạn và ít nhất một thiết bị.");
        return;
      }

      plans.push({ duration, options });
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
    const result = await res.json().catch(() => ({}));
    alert("❌ Cập nhật thất bại: " + (result.error || res.statusText));
  }
};

export async function handleEditClick(e) {
  const row = e.target.closest("tr");
  const id = row?.dataset?.id;
  if (!id) return;

  const res = await fetch(`/api/admin/products/${id}`);
  const product = await res.json();
  currentEditingId = id;
  currentEditingProduct = product;

  document.getElementById("editName").value = product.name;
  document.getElementById("editStt").value = product.stt;
  document.getElementById("editStatus").value = product.status || "con-hang";
  document.getElementById("editImage").value = "";

  const optionsArea = document.getElementById("editOptions");
  optionsArea.innerHTML = "";

  if (product.type === "physical") {
    optionsArea.innerHTML = `
      <label>Phân loại:</label>
      <div id="editVariantList"></div>
      <button id="addEditVariant" type="button">+ Thêm phân loại</button>
    `;

    const list = document.getElementById("editVariantList");
    product.variants.forEach((v, i) => {
      const div = document.createElement("div");
      div.className = "variant-edit-block";
      div.innerHTML = `
    <input type="text" class="edit-variant-size" value="${v.size}" />
    <input type="number" class="edit-variant-price" value="${v.price}" />
    <input type="file" class="edit-variant-image" accept="image/*" />
    ${
      v.image
        ? `<img src="/${v.image}" width="40" class="preview-variant-image" />`
        : ""
    }
    <button type="button" onclick="this.parentElement.remove()">❌</button>
  `;
      list.appendChild(div);
    });

    document.getElementById("addEditVariant").addEventListener("click", () => {
      const div = document.createElement("div");
      div.innerHTML = `
        <input type="text" class="edit-variant-size" />
        <input type="number" class="edit-variant-price" />
        <button type="button" onclick="this.parentElement.remove()">❌</button>
      `;
      document.getElementById("editVariantList").appendChild(div);
    });
  } else {
    optionsArea.innerHTML = `
      <label>Phân loại nhị cấp:</label>
      <div id="editPlanList"></div>
      <button id="addEditPlan" type="button">+ Thêm Option</button>
    `;

    const list = document.getElementById("editPlanList");

    const createOptionDiv = (device = "", price = "") => {
      const div = document.createElement("div");
      div.innerHTML = `
        <input type="text" class="edit-plan-device" value="${device}" />
        <input type="number" class="edit-plan-price" value="${price}" />
        <button type="button" onclick="this.parentElement.remove()">❌</button>
      `;
      return div;
    };

    const createPlanBlock = (duration = "", options = []) => {
      const wrapper = document.createElement("div");
      wrapper.className = "plan-block";
      wrapper.innerHTML = `
        <input type="text" class="edit-plan-duration" value="${duration}" />
        <div class="option-list"></div>
        <button type="button" class="add-option-btn">+ Phân nhánh</button>
        <button type="button" class="remove-plan-btn">❌ Xoá option</button>
        <hr/>
      `;

      const optionList = wrapper.querySelector(".option-list");
      options.forEach((opt) => {
        optionList.appendChild(createOptionDiv(opt.device, opt.price));
      });

      wrapper.querySelector(".add-option-btn").addEventListener("click", () => {
        optionList.appendChild(createOptionDiv());
      });

      wrapper
        .querySelector(".remove-plan-btn")
        .addEventListener("click", () => {
          wrapper.remove();
        });

      return wrapper;
    };

    product.plans.forEach((p) => {
      list.appendChild(createPlanBlock(p.duration, p.options));
    });

    document.getElementById("addEditPlan").addEventListener("click", () => {
      list.appendChild(createPlanBlock());
    });
  }

  document.getElementById("editPopup").classList.add("show");
}

export async function handleDeleteClick(e) {
  const row = e.target.closest("tr");
  const id = row?.dataset?.id;
  if (!id) return;

  if (confirm("Bạn chắc chắn muốn xoá?")) {
    await fetch(`/api/admin/delete/${id}`, { method: "DELETE" });
    loadProducts();
  }
}
