const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BillAtStore = new Schema({
    billId:{type:String, required:true,unique:true},
    name:String,
    phoneNumber:String,
    address:String,
    createdAt:{type:Date,default:Date.now}
})

module.exports = mongoose.model('BillAtStore',BillAtStore)