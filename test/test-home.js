// ===== Highlight khi click vào danh mục sản phẩm =====
const categoryItems = document.querySelectorAll(".category-list li");
categoryItems.forEach((item) => {
  item.addEventListener("click", () => {
    categoryItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
  });
});

// ===== Highlight khi click vào nav-links =====
const navLinks = document.querySelectorAll(".nav-links a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// ===== Toggle danh mục + xoay icon mũi tên =====
const toggleBtn = document.querySelector(".toggle-sidebar");
const categoryList = document.querySelector(".category-list");
const arrowIcon = document.querySelector(".fa-chevron-right");

toggleBtn.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    categoryList.classList.toggle("show");
    arrowIcon.classList.toggle("rotate");
  }
});
