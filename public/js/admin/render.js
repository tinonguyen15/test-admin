// 📄 render.js
import { handleEditClick, handleDeleteClick } from "./productActions.js";

const STATUS_LABELS = {
  "con-hang": "Đang bán",
  "het-hang": "Hết hàng",
  "sap-ra-mat": "Sắp ra mắt",
};

let typeChartInstance, statusChartInstance;

export async function loadProducts() {
  const res = await fetch("/api/admin/products");
  if (!res.ok) return alert("Không thể tải sản phẩm.");
  const products = await res.json();
  products.sort((a, b) => b.stt - a.stt); // Sắp xếp stt

  const physicalTableBody = document.getElementById("physicalTableBody");
  const digitalTableBody = document.getElementById("digitalTableBody");

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

  // Gắn lại sự kiện cho các nút sau khi DOM được render lại
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", handleEditClick);
  });

  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", handleDeleteClick);
  });

  renderTypeChart(counts);
  renderStatusChart(counts);
}

function renderTypeChart(counts) {
  const canvas = document.getElementById("typeChartCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (typeChartInstance) typeChartInstance.destroy();

  typeChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Thường", "Mở rộng"],
      datasets: [
        {
          label: "Số lượng",
          data: [counts.physical, counts.digital],
          backgroundColor: ["#4caf50", "#2196f3"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { bottom: 10 } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, stepSize: 1 },
        },
      },
    },
  });
}

function renderStatusChart(counts) {
  const canvas = document.getElementById("statusChartCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (statusChartInstance) statusChartInstance.destroy();

  statusChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Đang bán", "Hết hàng", "Sắp ra mắt"],
      datasets: [
        {
          label: "Số lượng",
          data: [counts["con-hang"], counts["het-hang"], counts["sap-ra-mat"]],
          backgroundColor: ["#8bc34a", "#f44336", "#ff9800"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}
