const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BoughtAtStore = new Schema({
    billId:{type: String, required: true},
    nameProduct:String,
    name:String,
    idProduct:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
    // phoneNumber:String,
    // address:String,
    price:Number,
    number:Number,
    createdAt:{type:Date,default:Date.now}
})

module.exports = mongoose.model('BoughtAtStore',BoughtAtStore)