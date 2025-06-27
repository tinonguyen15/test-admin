// 📄 productController.js
const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// ============================
// Thêm sản phẩm mới
// ============================
exports.addProduct = async (req, res) => {
  try {
    const { name, type, variants, plans, status } = req.body;

    // ✅ Xử lý ảnh chính
    const image = req.files?.image?.[0]
      ? "images/" + req.files.image[0].filename
      : "";

    // ✅ Lấy STT cao nhất trong cùng loại
    const currentCount = await Product.countDocuments({ type });
    const newStt = currentCount + 1;

    const productData = {
      name,
      type,
      stt: newStt,
      image,
      status: status || "con-hang",
    };

    // ✅ Nếu là sản phẩm vật lý
    if (type === "physical" && variants) {
      const parsedVariants = JSON.parse(variants);

      if (!Array.isArray(parsedVariants) || parsedVariants.length === 0)
        return res.status(400).json({ error: "⚠️ Cần ít nhất một biến thể." });

      // Kiểm tra size nếu có nhiều biến thể
      if (parsedVariants.length > 1) {
        const hasEmptySize = parsedVariants.some(
          (v) => !v.size || v.size.trim() === ""
        );
        if (hasEmptySize)
          return res.status(400).json({
            error: "⚠️ Khi có nhiều biến thể, mỗi dòng giá phải có size.",
          });
      }

      // Gán ảnh cho từng biến thể nếu có
      const variantImages = req.files?.variantImages || [];
      parsedVariants.forEach((variant, index) => {
        if (variantImages[index]) {
          variant.image = "images/" + variantImages[index].filename;
        }
      });

      // Kiểm tra giá
      for (let v of parsedVariants) {
        if (!Number.isFinite(v.price) || v.price < 0) {
          return res.status(400).json({ error: "⚠️ Giá phải là số không âm." });
        }
      }

      productData.variants = parsedVariants;
      productData.price = parsedVariants[0]?.price || 0;
    }

    // ✅ Nếu là sản phẩm số
    if (type === "digital" && plans) {
      const parsedPlans = JSON.parse(plans);
      productData.plans = parsedPlans;

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

    // Xoá ảnh nếu có
    if (product.image) {
      const imagePath = path.join(__dirname, "..", "public", product.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("⚠️ Không thể xoá ảnh:", err.message);
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    // ✅ Sau xoá, cập nhật lại STT trong cùng loại
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
    const productId = req.params.id;
    const { name, stt, type, variants, plans, status, variantImageIndexes } =
      req.body;

    const updateData = {
      name,
      stt: parseInt(stt),
      type,
      status,
    };

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "❌ Không tìm thấy sản phẩm" });
    }

    // ✅ Ảnh đại diện sản phẩm
    if (req.file) {
      updateData.image = "images/" + req.file.filename;

      if (product.image) {
        const oldPath = path.join(__dirname, "..", "public", product.image);
        fs.unlink(oldPath, (err) => {
          if (err) console.warn("⚠️ Không thể xoá ảnh đại diện:", err.message);
        });
      }
    }

    // ✅ Cập nhật sản phẩm vật lý
    if (type === "physical" && variants) {
      const parsedVariants = JSON.parse(variants);
      const indexes = JSON.parse(variantImageIndexes || "[]");
      const files = req.files?.variantImages || [];

      if (!Array.isArray(parsedVariants) || parsedVariants.length === 0)
        return res.status(400).json({ error: "⚠️ Cần ít nhất một biến thể." });

      // Duyệt từng variant và chèn ảnh nếu có file tương ứng
      const newVariants = parsedVariants.map((v, i) => {
        let variantWithImage = { ...v };

        // Nếu trong danh sách chỉ số và có file tương ứng
        const imageFileIndex = indexes.indexOf(i);
        if (imageFileIndex !== -1 && files[imageFileIndex]) {
          const filename = files[imageFileIndex].filename;
          variantWithImage.image = `images/${filename}`;

          // Xoá ảnh cũ nếu có
          if (product.variants?.[i]?.image) {
            const oldImagePath = path.join(
              __dirname,
              "..",
              "public",
              product.variants[i].image
            );
            fs.unlink(oldImagePath, (err) => {
              if (err)
                console.warn("⚠️ Không thể xoá ảnh variant cũ:", err.message);
            });
          }
        } else {
          // Không thay ảnh: giữ ảnh cũ
          variantWithImage.image = product.variants?.[i]?.image || "";
        }

        return variantWithImage;
      });

      updateData.variants = newVariants;
      updateData.plans = undefined;
      updateData.price = newVariants[0]?.price || 0;
    }

    // ✅ Cập nhật sản phẩm số
    if (type === "digital" && plans) {
      const parsedPlans = JSON.parse(plans);
      updateData.plans = parsedPlans;
      updateData.variants = undefined;

      let minPrice = Infinity;
      parsedPlans.forEach((plan) => {
        plan.options.forEach((opt) => {
          if (opt.price < minPrice) minPrice = opt.price;
        });
      });
      updateData.price = Number.isFinite(minPrice) ? minPrice : 0;
    }

    // ✅ Thực hiện cập nhật
    await Product.findByIdAndUpdate(productId, updateData, { new: true });
    return res.json({ success: true, message: "✅ Đã cập nhật sản phẩm" });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật:", err.message);
    return res.status(500).json({ success: false, error: err.message });
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
