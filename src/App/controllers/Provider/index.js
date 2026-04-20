const Provider = require("../../models/Provider");


class ProviderController{
    async create(req,res){
        try {
            const name = req.body?.name
            const promise = new Provider({name:name})
            const data = await promise.save()
            res.status(200).json({
                success:true,
                title:'Creating provider',
                data:data
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    async change(req, res){
        try {
            const id = req.body.idProvider
            const value = req.body.value
            await Provider.updateOne({_id:id},{$set:{name:value}})
            const data = await Provider.find() 
            res.status(200).json({
                success:true,
                title:'Updating provider',
                data:data
            })
        } catch (error) {
            console.log(error.message);
        }
    }
    async remove(req,res) {
        try {
            const id = req.body.idProvider
            await Provider.deleteOne({_id:id})
            const data = await Provider.find()
            res.status(200).json({
                success:true,
                title:'removing provider',
                data:data
            })
        } catch (error) {
            console.log(error.message);
        }
    }
    async show(req,res){
        try {
            const data = await Provider.find().sort({'createdAt':-1})
            res.status(200).json({
                success:true,
                title:'show provider',
                data:data
            })
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new ProviderController();