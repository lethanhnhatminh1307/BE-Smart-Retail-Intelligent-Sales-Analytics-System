const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductVariant = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        sku: { type: String }, 
        color: { type: String, required: true, default: 'Mặc định' },
        size: { type: String, required: true },
        cost: { type: Number, required: true, default: 0 },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('ProductVariant', ProductVariant);
