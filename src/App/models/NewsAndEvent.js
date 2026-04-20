const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Document = mongoose.Document

const NewsAndEvent = Schema({
    title:{type:String,required:true},
    information:{type:String,required:true},
    image:{type:String},
    titleImage:{type:String},
    createdAt:{type:Date,default:Date.now}
})

module.exports = mongoose.model('NewAndEvent',NewsAndEvent)