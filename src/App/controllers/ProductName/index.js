const ProductName = require("../../models/ProductName");


class ProductNameController{
    async create(req,res){
        try {
            const name = req.body?.name
            const promise = new ProductName({name:name})
            const data = await promise.save()
            res.status(200).json({
                success:true,
                title:'Creating ProductName',
                data:data
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    async change(req, res){
        try {
            const id = req.body.idProductName
            const value = req.body.value
            await ProductName.updateOne({_id:id},{$set:{name:value}})
            const data = await ProductName.find()
            res.status(200).json({
                success:true,
                title:'Updating ProductName',
                data:data
            })
        } catch (error) {
            console.log(error.message);
        }
    }
    async remove(req,res) {
        try {
            const id = req.body.idProductName
            await ProductName.deleteOne({_id:id})
            const data = await ProductName.find()
            res.status(200).json({
                success:true,
                title:'removing ProductName',
                data:data
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    async show(req,res){
        try {
            const data = await ProductName.find().sort({'createdAt':-1})
            res.status(200).json({
                success:true,
                title:'show productName',
                data:data
            })
        } catch (error) {
            console.log(error);
        }
    }

    async search(req, res, next) {
        try {
            const {key=''} = req.query;
            const data = await ProductName.find({name:{$regex: new RegExp(key,'i')}})
            res.status(200).json({
                success:true,
                title:'search product name',
                data
            })
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = new ProductNameController();