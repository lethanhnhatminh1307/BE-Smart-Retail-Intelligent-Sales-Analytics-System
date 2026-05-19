const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscountSchema = new Schema({
  expireAt: { type: Date, required: true },
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  usedAt: { type: Date, default: null },
});

module.exports = mongoose.model("Discount", DiscountSchema);
