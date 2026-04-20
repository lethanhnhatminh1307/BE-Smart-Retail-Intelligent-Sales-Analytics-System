const isValidID = require('../../../utils/isValidID')
const Cart = require('../../models/Cart')
const Product = require('../../models/Product')

class CartController {
    // get all product in cart
    get(req, res, next) {
        const perPage = req.query.perPage*1
        const page = req.query.page*1
        const start = (page -1)*perPage
        const id = req.query.id
        Cart.find({userID:id}).skip(start).limit(perPage).populate('idProduct')
            .then(data =>{
                if(data){
                   return res.status(200).json({
                        success:true,
                        title:'success',
                        currentPage:page,
                        data                     
                   }) 
                }
                return res.status(200).json({success:false,title:'error',message:'check info',data:[]})
            })
            .catch(next) 

    }

    async updateInCart(req,res,next) {
        const {id=null} = req.body
        const result = []
        const cartUpdate = Array.isArray(req.body.cartUpdate)?req.body.cartUpdate : [] 
        await cartUpdate.forEach(item=>{
            Cart.updateOne({$and:[{_id:item._id},{size:item.size},{color:item.color}]},{
                number:item.number
            })
                .then()
                .catch(err=>{
                   return  res.send('error')
                })
        })
        const data =await Cart.find({userID:id}).populate('idProduct')
        return res.status(200).json({
            title:'success',
            success:true,
            data
        })
    }

    // update cart (add product into cart) 
    async update(req, res, next) {
        const {id,idProduct,number,size,image,price} = req.body 
        const product = await Product.findOne({_id:idProduct})
        if(number > product.number) return  res.status(200).json({
            title:'warning',
            success:false,
            message:'Vượt quá giới hạn, số lượng sản phẩm còn là '+product.number,
            data:[],
            })
        product.number = product.number - number
        await product.save()
        const data = await Cart.findOneAndUpdate({ userID: id,idProduct,size,price,image},
            { $inc: { number:number } },
            { upsert: true, returnOriginal: false }
        ).populate('idProduct')
           
        const totalData =await Cart.find({userID:id}).populate('idProduct')
        return  res.status(200).json({
                    title:'success',
                    success:true,
                    data:totalData,
                    message:'Thêm thành công'
                    })
       
    }

    // delete a product in cart
    async delete(req, res, next) {
        try {
            const id = req.body.id
            const userID = req.body.userID
            const cart = await Cart.findOne({_id:id})
            if(cart){
                const data = await Product.update({_id:isValidID(cart.idProduct)},{$inc:{number:cart.number}});
            }
            await Cart.deleteOne({ _id: id,userID})
                .then(data => {
                    if(!data) return res.status(403).json({
                        success:false,
                        title:'error',
                        message: 'check info'
                    })               
                })
                .catch(err=> res.send(err))
            await Cart.find({userID}).populate('idProduct')
                .then(data=> res.status(200).json({
                    success: true,
                    title:'success',
                    data
                }))
                .catch(next)
        } catch (error) {
            res.send(error)
        }
    }
}

module.exports = new CartController()
