const mongoose = require('mongoose');
const Schema = mongoose.Schema;
slug = require('mongoose-slug-generator');
mongoose.plugin(slug)


const CategorySchema = new Schema({
    type:{type:String},
    slug: { type: String, slug: "type",unique: true},
})



module.exports = mongoose.model('Category', CategorySchema)