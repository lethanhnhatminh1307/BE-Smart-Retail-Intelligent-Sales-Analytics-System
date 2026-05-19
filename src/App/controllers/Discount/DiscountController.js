const Discount = require("../../models/Discount");

class DiscountController {
  async create(req, res) {
    try {
      const { code, discount, type, expireAt } = req.body;
      if (!code || discount == null || !type || !expireAt) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
      }

      const existing = await Discount.findOne({ code });
      if (existing) return res.status(400).json({ error: "Mã đã tồn tại" });

      const doc = await Discount.create({ code, discount, type, expireAt });
      return res.status(201).json(doc);
    } catch (error) {
      console.error("Lỗi khi tạo mã giảm giá:", error);
      return res.status(500).json({ error: "Lỗi khi tạo mã giảm giá" });
    }
  }

  async getAll(req, res) {
    try {
      const docs = await Discount.find().sort({ createdAt: -1 });
      return res.status(200).json(docs);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách mã:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách mã" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const doc = await Discount.findById(id);
      if (!doc) return res.status(404).json({ error: "Không tìm thấy mã" });
      return res.status(200).json(doc);
    } catch (error) {
      console.error("Lỗi khi lấy mã theo id:", error);
      return res.status(500).json({ error: "Lỗi khi lấy mã theo id" });
    }
  }

  async getByCode(req, res) {
    try {
      const code = req.params.code || req.query.code;
      if (!code) return res.status(400).json({ error: "Thiếu code" });
      const doc = await Discount.findOne({ code });
      if (!doc) return res.status(404).json({ error: "Không tìm thấy mã" });
      const now = new Date();
      if (doc.expireAt && new Date(doc.expireAt) < now)
        return res.status(400).json({ error: "Mã đã hết hạn" });
      if (doc.usedAt) return res.status(400).json({ error: "Mã đã được sử dụng" });
      return res.status(200).json(doc);
    } catch (error) {
      console.error("Lỗi khi lấy mã theo code:", error);
      return res.status(500).json({ error: "Lỗi khi lấy mã theo code" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const doc = await Discount.findByIdAndUpdate(id, updates, { new: true });
      if (!doc) return res.status(404).json({ error: "Không tìm thấy mã" });
      return res.status(200).json(doc);
    } catch (error) {
      console.error("Lỗi khi cập nhật mã:", error);
      return res.status(500).json({ error: "Lỗi khi cập nhật mã" });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const doc = await Discount.findByIdAndDelete(id);
      if (!doc) return res.status(404).json({ error: "Không tìm thấy mã" });
      return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      console.error("Lỗi khi xóa mã:", error);
      return res.status(500).json({ error: "Lỗi khi xóa mã" });
    }
  }
}

module.exports = new DiscountController();
