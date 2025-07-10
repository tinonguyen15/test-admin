// 📄 productController.js
const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// ============================
// Thêm sản phẩm mới
// ============================
exports.addProduct = async (req, res) => {
  try {
    const { name, type, variants, plans, status, variantGroup } = req.body;

    const image = req.files?.image?.[0]
      ? "uploads/" + req.files.image[0].filename
      : "";

    // 👉 Kiểm tra nếu chưa chọn ảnh
    if (!image) {
      return res
        .status(400)
        .json({ error: "⚠️ Vui lòng chọn ảnh cho sản phẩm." });
    }

    const currentCount = await Product.countDocuments({ type });
    const newStt = currentCount + 1;

    const productData = {
      name,
      type,
      stt: newStt,
      image,
      status: status || "con-hang",
    };

    // Sản phẩm vật lý
    if (type === "physical" && variants) {
      const parsedVariants = JSON.parse(variants);

      if (!Array.isArray(parsedVariants) || parsedVariants.length === 0)
        return res.status(400).json({ error: "⚠️ Cần ít nhất một biến thể." });

      if (parsedVariants.length > 1) {
        const hasEmptySize = parsedVariants.some(
          (v) => !v.size || v.size.trim() === ""
        );
        if (hasEmptySize)
          return res.status(400).json({
            error: "⚠️ Khi có nhiều biến thể, mỗi dòng giá phải có size.",
          });
      }

      const variantImages = req.files?.variantImages || [];
      parsedVariants.forEach((variant, index) => {
        if (variantImages[index]) {
          variant.image = "uploads/" + variantImages[index].filename;
        }
      });

      for (let v of parsedVariants) {
        if (!Number.isFinite(v.price) || v.price < 0) {
          return res.status(400).json({ error: "⚠️ Giá phải là số không âm." });
        }
      }

      productData.variants = parsedVariants;
      productData.price = parsedVariants[0]?.price || 0;
      productData.variantGroup = variantGroup || "Phân loại";
    }

    // Sản phẩm số
    if (type === "digital" && plans) {
      const parsedPlans = JSON.parse(plans);
      const planGroup = JSON.parse(req.body.planGroup || "{}");

      productData.plans = parsedPlans;
      productData.planGroup = {
        durationName: planGroup.durationName || "Thời hạn",
        deviceName: planGroup.deviceName || "Thiết bị",
      };

      let minPrice = Infinity;
      parsedPlans.forEach((p) =>
        p.options.forEach((opt) => {
          if (opt.price < minPrice) minPrice = opt.price;
        })
      );
      productData.price = isFinite(minPrice) ? minPrice : 0;
    }

    await new Product(productData).save();
    return res
      .status(201)
      .json({ success: true, message: "✅ Đã thêm sản phẩm" });
  } catch (err) {
    console.error("❌ Thêm sản phẩm lỗi:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ============================
// Lấy tất cả sản phẩm
// ============================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ stt: 1 });
    return res.json(products);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "❌ Lỗi khi lấy sản phẩm" });
  }
};

// ============================
// Xoá sản phẩm
// ============================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "❌ Không tìm thấy sản phẩm" });

    if (product.image) {
      const imagePath = path.join(__dirname, "..", "public", product.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("⚠️ Không thể xoá ảnh:", err.message);
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    const remaining = await Product.find({ type: product.type }).sort({
      stt: 1,
    });
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].stt = i + 1;
      await remaining[i].save();
    }

    return res.json({ success: true, message: "✅ Đã xoá và cập nhật STT" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "❌ Lỗi xoá sản phẩm" });
  }
};

// ============================
// Sửa sản phẩm
// ============================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    const { name, stt, status, type, variantGroup } = req.body;

    product.name = name;
    product.stt = stt;
    product.status = status;
    product.type = type;
    product.variantGroup = req.body.variantGroup || "Phân loại";

    // ✅ Nếu có ảnh chính mới
    if (req.files?.image?.length) {
      if (product.image && fs.existsSync("public/" + product.image)) {
        fs.unlinkSync("public/" + product.image);
      }
      product.image = `uploads/${req.files.image[0].filename}`;
    }

    // ✅ Nếu là sản phẩm physical
    if (type === "physical") {
      const variants = JSON.parse(req.body.variants || "[]");
      const imageIndexes = JSON.parse(req.body.variantImageIndexes || "[]");

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const variantImageFile =
          req.files?.variantImages?.[imageIndexes.indexOf(i)];

        if (
          variantImageFile &&
          product.variants?.[i]?.image &&
          fs.existsSync("public/" + product.variants[i].image)
        ) {
          fs.unlinkSync("public/" + product.variants[i].image);
        }

        if (variantImageFile) {
          v.image = `uploads/${variantImageFile.filename}`;
        } else if (product.variants?.[i]?.image) {
          v.image = product.variants[i].image;
        }
      }

      product.variants = variants;
      product.variantGroup = variantGroup || "Phân loại";
    }

    // ✅ Nếu là sản phẩm digital
    if (type === "digital") {
      const plans = JSON.parse(req.body.plans || "[]");
      const planGroup = JSON.parse(req.body.planGroup || "{}");

      product.plans = plans;
      product.planGroup = {
        durationName: planGroup.durationName || "Thời hạn",
        deviceName: planGroup.deviceName || "Thiết bị",
      };
    }

    await product.save();
    res.json({ message: "✅ Đã cập nhật sản phẩm" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Lỗi khi cập nhật sản phẩm" });
  }
};

// ============================
// Lấy chi tiết một sản phẩm
// ============================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "❌ Không tìm thấy sản phẩm" });

    return res.json(product);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "❌ Lỗi khi lấy sản phẩm" });
  }
};
