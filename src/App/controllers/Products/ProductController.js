const Product = require('../../models/Product')
const serverPort = require('../../../utils/serverPort')
const Category = require('../../models/Category')
const serverName = require('os').hostname()
const fs = require('fs')
const SpecifyBill = require('../../models/SpecifyBill')

class ProductController {
    
    get(req, res,next) {
        const nameSearch = req.query.find
        Product.find({name:{$regex:new RegExp(nameSearch)}}).sortable(req)
            .then(data=>{
                return res.status(200).json(data)
            })
            .catch(next)
    }

    async getOne(req, res, next){
        try {
            const slug =req.query.slug || ''
            const data = await Product.findOne({slug:slug })
            const nameType = await Category.findOne({slug:data?.type})
            const suggestion =  await Product.find({type:data.type,slug:{$ne:slug}}).limit(10)
            res.json({
                title:'success',
                success:true,
                data:{
                    data,
                    nameType,
                    suggestion
                }
            })
        } catch (error) {
            res.send(error)
        }
        
    }

    getProduct(req, res, next){
        const idProduct = req.query.idProduct
        Product.find({_id: idProduct})
            .then(data=>res.json(data))
            .catch(next)
    }
    
    getImage(req, res, next) {
        const id = `src\\public\\images\\${req.query.image}`
        fs.readFile(id,(err, data)=>{
            res.end(data)
        })
    }

    getType(req, res, next) {
        const type = req.query.typeProduct
        if(!type) return res.status(400).json({
            message:'fail! the type is empty or invalid',
            data:[]
        })
       
        Product.find({type:type}).sortable(req)
            .then(products => res.status(200).json(
                {
                    message:'successfully',
                    data:products
                }
            ))
            .catch(next)
    }

    async uploadProduct(req, res, next){
        try {
           
            const files = req.files

            const {size,price,number,name,description,type,billId,itemId} = req.body
            // console.log(size +" " + price + " " + number + " " + description+" "+name+" " +type);
            const image = []
            console.log('size: ' + size);
            const sizeArr = size.split(',')

            files.forEach((file) => {
                image.push(`http://${serverName}:${serverPort}/product/open-image?image=${file?.filename}`)
            })
   
            const data  = new Product({size:sizeArr,price,number,image,name,description,type,billId,itemId})
            await data.save()
            await SpecifyBill.updateOne({billId: billId, itemId: itemId},{$inc:{recentNumber:-number}})
   
            return res.json({title:'success',success:true,data,message:'product updated successfully'})
        } catch (error) {
            console.log(error);
        }
        
    }

    async delete(req, res, next) {
        try {
            const id = req.body.idProduct;
            const number = req.body.number*1;
            const {billId='',itemId='',} = req.body
            const data = await Product.findOneAndDelete({ _id: id });
            await SpecifyBill.updateOne({billId,itemId},{$inc:{recentNumber:number}})
            return res.status(200).json({
                title:'success',success:true,data
            })
        } catch (error) {
            console.log(error);
        }
    }
    
    async modify(req, res) {
        try {
            const files = req.files
            const  {size,price,description,type,idProduct,fileUpdate} = req.body
            let image = []  
            const sizeArr = size.split(',')
            files.forEach((file) => {
                image.push(`http://${serverName}:${serverPort}/product/open-image?image=${file?.filename}`)
            })
            if(fileUpdate) {
                if(Array.isArray(fileUpdate)) {
                    image = [...image,...fileUpdate]
                }else image=[...image,fileUpdate]
            }
            const data = await Product.updateOne({_id:idProduct},{size:sizeArr,price,description,type,image})
            return res.status(200).json({
                title:'update-product',
                success:true,
                data,
                message: 'modify successfully'
            })

        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new ProductController();