const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BillSChema = new Schema({
    billId:{type: String,required:true},
    provider:{type: String,required: true},
    date: {type: String},
    // number:{type:Number},
    createdAt:{type: Date,default: Date.now},
})
// BillSChema.virtual('_provider', {
//     ref: 'Provider', 
//     localField: 'provider', 
//     foreignField: 'provider',
//     justOne: true,

//   });

module.exports =  mongoose.model('Bill', BillSChema)