// js/admin/imagePreview.js
const previews = {
  logoInput: "logoPreview",
  bannerInput: "bannerPreview",
  physicalImageInput: "physicalImagePreview",
  digitalImageInput: "digitalImagePreview",
  editImage: "editImagePreview",
};

document.querySelectorAll(".selectImageBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const inputId = btn.dataset.target;
    const input = document.getElementById(inputId);
    input && input.click();
  });
});

Object.keys(previews).forEach((inputId) => {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previews[inputId]);

  if (input && preview) {
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }
});
