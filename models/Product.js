const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    stt: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    type: {
      type: String,
      enum: ["physical", "digital"],
      required: true,
    },
    variantGroup: { type: String, default: "Phân loại" }, // ✅ Tên biến thể cho physical
    variants: Array,
    plans: Array,

    // ✅ Thêm tên nhóm phân loại cho sản phẩm digital
    planGroup: {
      durationName: { type: String, default: "Lựa chọn 1" },
      deviceName: { type: String, default: "Lựa chọn 2" },
    },

    status: {
      type: String,
      enum: ["con-hang", "het-hang", "sap-ra-mat"],
      default: "con-hang",
    },
  },
  { timestamps: true }
);

// Tự động sắp xếp theo stt mỗi khi gọi find()
productSchema.pre(/^find/, function (next) {
  this.sort({ stt: 1 });
  next();
});

module.exports = mongoose.model("Product", productSchema);
