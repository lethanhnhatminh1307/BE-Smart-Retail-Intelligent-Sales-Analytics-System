const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExportBill = Schema({
    billId:{type: String},
    itemId:{type: String},
    number:{type:Number,default:0},
    price:{type:Number,default:0},
    name:{type:String},
    createdAt:{type:Date,default:Date.now}
})

ExportBill.virtual('_billId', {
    ref: 'Bill', 
    localField: 'billId', 
    foreignField: 'billId', 
    justOne: true,

  });

  ExportBill.virtual('_itemId', {
    ref: 'SpecifyBill', 
    localField: 'itemId',
    foreignField: 'itemId',
    justOne: true,

  });

module.exports = mongoose.model('ExportBill',ExportBill)