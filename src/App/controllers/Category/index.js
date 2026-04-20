const Category = require('../../models/Category')
const Product = require('../../models/Product')


class CategoryController {
    async show(req, res, next){
        const data = await Category.find()
        res.status(200).json({
            success:true,
            title:'success',
            data
        })
    }

    async create(req, res, next) {
        const type = req.body.type
        const check = await Category.findOne({ type: type})
        if(check) return res.status(200).json({
            success:false,
            message:'Loại này đã tồn tại'
        })
        const newCategory = new Category({type})
        await newCategory.save()
        const data = await Category.find()
        return res.status(200).json({
            title:'success',
            success:true,
            message:'Thêm thành công',
            data
        })
    }
    async delete(req, res, next) {
        const id = req.body.idType
        const deCategory = await Category.deleteOne({_id:id})
        const data = await Category.find()
        return res.status(200).json({
            success:deCategory.acknowledged,
            title:'success',
            data

        })
    }
    async replace(req, res, next) {
        const id = req.body?.idType
        const newType = req.body?.value
        const oldType = req.body?.oldType
        try {
            await Category.deleteOne({_id:id})
            const newCategory = new Category({type:newType})
            await newCategory.save()
            await Product.updateMany({type:oldType},{type:newCategory?.slug})
            const data = await Category.find()
            return res.status(200).json({
                title:'success',
                success:true,
                message:'Chỉnh sữa thành công',
                data,
            })
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = new CategoryController()