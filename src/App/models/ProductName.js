const mongoose = require('mongoose');
const Schema = mongoose.Schema;
slug = require('mongoose-slug-generator');
mongoose.plugin(slug)


const ProductName  = new Schema({
    name:{type:String, required:true},
    slug:{type:String, slug:'name',unique:true},
    createdAt:{type:Date, default:Date.now}
})

module.exports = mongoose.model('ProductName',ProductName)