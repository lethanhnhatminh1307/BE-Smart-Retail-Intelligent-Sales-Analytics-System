const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Inventory = Schema({
    billId:{type:String},
    itemId:{type:String},
    number:{type:Number,default:0},
    isAdd:{type:Boolean,default:false},
    name:{type:String},
    price:{type:Number,default:0},
    createdAt:{type:Date,default:Date.now}
})
Inventory.virtual('_billId', {
    ref: 'Bill', 
    localField: 'billId', 
    foreignField: 'billId', 
    justOne: true,

  });

Inventory.virtual('_itemId', {
    ref: 'SpecifyBill', 
    localField: 'itemId',
    foreignField: 'itemId',
    justOne: true,

  });
module.exports = mongoose.model('Inventory',Inventory)