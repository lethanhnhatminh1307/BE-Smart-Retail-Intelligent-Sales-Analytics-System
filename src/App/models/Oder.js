const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const OderSchema = new Schema(
    {
        infoOfOder: {type: Array, required: true},
        infoOfUser:{
            type: mongoose.Schema.Types.ObjectId, ref: 'Account' 
        },
        toName:{type:String,required:true},
        toPhoneNumber:{type:String,required:true},
        toProvince:{type:Number,required:true},
        toDistrict:{type:Number,required:true},
        toVillage:{type:String,required:true},
        address:{type:String},
        toSpecificAddress:{type:String,required:true},
        typeOfPayment: {type: String, required: true},
        codeDiscount: {type: String},
        isPaid:{type:Boolean, default: false},
        note:String,
        code:{type:String, default:null},
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { 
        collection:'Oder',
        timeseries: true
    },
);

OderSchema.query.sortable = function(req){
        const type = ['asc','desc'].includes(req.query?.type)?req.query?.type:'desc'
        return this.sort({
            [req.query.column]:type
        })
}

module.exports = mongoose.model('Oder', OderSchema);