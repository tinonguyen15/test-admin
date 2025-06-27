fetch("/api/admin/products")
  .then((res) => res.json())
  .then((products) => {
    const container = document.getElementById("product-list");
    container.innerHTML = ""; // Clear cũ

    products.forEach((p) => {
      const div = document.createElement("div");
      div.style =
        "border:1px solid #ccc; margin:10px; padding:10px; width:200px; display:inline-block;";

      let content = `<img src="/images/${p.image}" width="150"><br><strong>${p.name}</strong><br>`;

      if (p.type === "physical") {
        const variants = p.variants || [];

        if (variants.length === 0) {
          content += `<span>Chưa có giá</span>`;
        } else if (variants.length === 1) {
          const v = variants[0];
          const priceDisplay = Number(v.price).toLocaleString() + "₫";
          if (v.size && v.size.trim()) {
            content += `Size: <select disabled><option>${v.size}</option></select><br>`;
          }
          content += `<strong>${priceDisplay}</strong>`;
        } else {
          // Nhiều size → hiển thị chọn size và thay đổi giá theo size
          const defaultVariant = variants[0];
          const priceDisplay =
            Number(defaultVariant.price).toLocaleString() + "₫";
          const selectId = `select-${p._id}`;
          const priceId = `price-${p._id}`;

          content += `
            Size: <select id="${selectId}">
              ${variants
                .map((v) => `<option value="${v.price}">${v.size}</option>`)
                .join("")}
            </select><br>
            <strong id="${priceId}">${priceDisplay}</strong>
          `;
        }
      } else {
        content += `<span>Sản phẩm số</span>`;
      }

      div.innerHTML = content;
      container.appendChild(div);

      // Gắn sự kiện thay đổi giá theo size (nếu có nhiều size)
      if (p.type === "physical" && (p.variants || []).length > 1) {
        const selectEl = document.getElementById(`select-${p._id}`);
        const priceEl = document.getElementById(`price-${p._id}`);
        if (selectEl && priceEl) {
          selectEl.addEventListener("change", (e) => {
            const selectedPrice = e.target.value;
            priceEl.textContent = Number(selectedPrice).toLocaleString() + "₫";
          });
        }
      }
    });
  });
