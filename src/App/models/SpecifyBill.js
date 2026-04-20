const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SpecifyBillSchema = new Schema({
    billId:{type:String},
    itemId:{type: String, required:true},
    name:{type: String,default:'Sản phẩm chưa có tên'},
    number:{type: Number,default:0},
    price:{type: Number,default:0},
    isAdd:{type: Boolean,default:false},
    recentNumber:{type: Number,default:0},
    createdAt:{type: Date,default:Date.now}
})

SpecifyBillSchema.virtual('_billId', {
    ref: 'Bill', 
    localField: 'billId', 
    foreignField: 'billId',
    justOne: true,

  });

module.exports = mongoose.model('SpecifyBill',SpecifyBillSchema)