// js/admin/sidebar.js
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector("aside");
const icon = menuToggle.querySelector("i");

function toggleMenu() {
  sidebar.classList.toggle("open");
  menuToggle.classList.toggle("open");

  if (sidebar.classList.contains("open")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
    document.addEventListener("click", handleOutsideClick);
  } else {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
    document.removeEventListener("click", handleOutsideClick);
  }
}

function handleOutsideClick(e) {
  if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    sidebar.classList.remove("open");
    menuToggle.classList.remove("open");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
    document.removeEventListener("click", handleOutsideClick);
  }
}

menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});
