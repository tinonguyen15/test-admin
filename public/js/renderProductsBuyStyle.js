// renderProductsBuyStyle.js
const STATUS_LABELS = {
  "con-hang": "Đang bán",
  "het-hang": "Hết hàng",
  "sap-ra-mat": "Sắp ra mắt",
};

let productListData = [];

// ===== CẬP NHẬT GIÁ & ẢNH KHI CHỌN SIZE (PHYSICAL) =====
function selectSize(button, priceId, groupName, productIndex, variantIndex) {
  const all = document.querySelectorAll(`#${groupName} .size-btn`);
  all.forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");

  const price = Number(button.dataset.price).toLocaleString();
  document.getElementById(priceId).innerText = `Giá: ${price}₫`;

  const image = productListData[productIndex].variants[variantIndex]?.image;
  if (image) {
    const productCard = document.getElementById(`product-card-${productIndex}`);
    const img = productCard.querySelector(".product-image");
    img.src = image;
  }
}

// ===== CẬP NHẬT GIÁ CHO DIGITAL (LOẠI TK) =====
function selectDigitalDevice(index, deviceIndex) {
  const durationIndex = [
    ...document.querySelectorAll(`#duration-${index} .size-btn`),
  ].findIndex((btn) => btn.classList.contains("active"));

  const all = document.querySelectorAll(`#device-${index} .size-btn`);
  all.forEach((btn) => btn.classList.remove("active"));
  const btn = document.getElementById(`device-${index}-${deviceIndex}`);
  btn.classList.add("active");

  const selectedPrice =
    productListData[index].plans[durationIndex].options[deviceIndex].price;
  document.getElementById(
    `price-${index}`
  ).innerText = `Giá: ${selectedPrice.toLocaleString()}₫`;
}

// ===== CHỌN GÓI THỜI HẠN (DURATION) =====
function selectDigitalOption(index, durationIndex) {
  const all = document.querySelectorAll(`#duration-${index} .size-btn`);
  all.forEach((btn) => btn.classList.remove("active"));
  const btn = document.getElementById(`duration-${index}-${durationIndex}`);
  btn.classList.add("active");

  const deviceList = productListData[index].plans[durationIndex].options;
  const deviceGroup = document.getElementById(`device-${index}`);
  const priceId = `price-${index}`;

  deviceGroup.innerHTML = deviceList
    .map(
      (opt, j) => `
      <button
        class="size-btn${j === 0 ? " active" : ""}"
        id="device-${index}-${j}"
        data-price="${opt.price}"
        onclick="selectDigitalDevice('${index}', ${j})"
      >
        ${opt.device}
      </button>
    `
    )
    .join("");

  const price = deviceList[0].price.toLocaleString();
  document.getElementById(priceId).innerText = `Giá: ${price} ₫`;
}

// ===== TẢI TOÀN BỘ SẢN PHẨM =====
async function loadProductsForUser() {
  try {
    const res = await fetch("/api/products");
    productListData = await res.json();

    const list = document.getElementById("productList");
    list.innerHTML = "";

    productListData.forEach((p, index) => {
      const statusText = STATUS_LABELS[p.status] || "Không rõ";
      const priceId = `price-${index}`;
      let detailHTML = "";

      if (p.type === "physical" && p.variants?.length) {
        const groupName = `size-${index}`;
        const sizeButtons = p.variants
          .map(
            (v, i) => `
            <button 
              class="size-btn${i === 0 ? " active" : ""}" 
              data-price="${v.price}" 
              onclick="selectSize(this, '${priceId}', '${groupName}', ${index}, ${i})"
            >
              ${v.size}
            </button>
          `
          )
          .join("");

        detailHTML = `
          <div class="product-details">
            <div class="size">
              <strong>Size:</strong>
              <div class="size-options" id="${groupName}">
                ${sizeButtons}
              </div>
            </div>
            <div class="price">
              <p id="${priceId}" class="product-price">Giá: ${p.variants[0].price.toLocaleString()}₫</p>
            </div>
          </div>
        `;
      } else if (p.type === "digital" && p.plans?.length) {
        const durationButtons = p.plans
          .map(
            (plan, i) => `
            <button
              class="size-btn${i === 0 ? " active" : ""}"
              id="duration-${index}-${i}"
              onclick="selectDigitalOption('${index}', ${i})"
            >
              ${plan.duration}
            </button>
          `
          )
          .join("");

        const deviceButtons = p.plans[0].options
          .map(
            (opt, j) => `
            <button
              class="size-btn${j === 0 ? " active" : ""}"
              id="device-${index}-${j}"
              data-price="${opt.price}"
              onclick="selectDigitalDevice('${index}', ${j})"
            >
              ${opt.device}
            </button>
          `
          )
          .join("");

        detailHTML = `
          <div class="product-details" id="digital-${index}">
            <div class="size">
              <strong>Thời hạn:</strong>
              <div class="size-options" id="duration-${index}">
                ${durationButtons}
              </div>
              <strong>Tháng</strong>
            </div>
            <div class="size">
              <strong>Loại TK:</strong>
              <div class="size-options" id="device-${index}">
                ${deviceButtons}
              </div>
            </div>
            <div class="price">
              <p id="${priceId}" class="product-price">
                Giá: ${p.plans[0].options[0].price.toLocaleString()}₫
              </p>
            </div>
          </div>
        `;
      } else {
        detailHTML = `<div class="product-details"><p class="product-price">Liên hệ</p></div>`;
      }

      const linkToMessenger = `https://www.facebook.com/messages/t/602776046262597?ref=${encodeURIComponent(
        p._id
      )}`;

      const imageSrc =
        p.type === "physical" && p.variants?.[0]?.image
          ? p.variants[0].image
          : p.image;

      const item = `
        <div class="product-card" id="product-card-${index}">
          <img src="${imageSrc}" alt="${p.name}" class="product-image" />
          <h3 class="name-product">${p.name}</h3>
          <div class="status">
            <p class="status-content"> <strong>Trạng thái:</strong> </p>
            <p class="status ${p.status}"> ${statusText}</p>
          </div>
          ${detailHTML}
          <div class="bottom-product">
          <a href="${linkToMessenger}" target="_blank" class="buy-btn">
          <button><i class="fas fa-cart-plus"></i></button>
            <button> Mua ngay</button>
          </a>
          </div>
        </div>
      `;

      list.innerHTML += item;
    });
  } catch (err) {
    console.error("Không thể tải sản phẩm:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadProductsForUser);
