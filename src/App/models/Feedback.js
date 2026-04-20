const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    userID:{type:String, required:true,ref:'Account'},
    idProduct:{type:String, required:true},
    starNumber:{type:Number, required:true},
    message:{type:String},
    reply:{type:Array,default:[]},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date, default:Date.now}
});


module.exports = mongoose.model('Feedback', FeedbackSchema);