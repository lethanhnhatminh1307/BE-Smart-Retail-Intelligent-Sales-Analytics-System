const NewsAndEventSchema = require('../../models/NewsAndEvent')
const serverPort = require('../../../utils/serverPort')
const serverName = require('os').hostname()
class NewsAndEvent{
    async show(req,res){
        try {
            const data = await NewsAndEventSchema.find().sort({createdAt:1})
            res.status(200).json({
                title:'show news',
                success: true,
                data
            })
        } catch (error) {
            console.log(error);
        }
    }

    async showSpecify(req, res, next) {
        try {
            const id = req.query.idNews;
            if(!id) return res.status(403).json({
                title:'dont find information',
                success:false,
                data:{}
            })
            const data = await NewsAndEventSchema.findOne({_id:id})
            if(data) return res.status(200).json({
                success:true,
                title:'show specify information',
                data
            })
            return res.status(403).json({
                title:'dont find information',
                success:false,
                data:{}
            })
        } catch (error) {
            console.log(error);
        }
    }
    async addPost(req, res){
        try {
            const {title,information,titleImage} = req.body
            const image = `http://${serverName}:${serverPort}/product/open-image?image=${req?.file?.filename }`
            const newData = new NewsAndEventSchema({title, information, image, titleImage})
            const data = await newData.save()
            res.status(200).json({
                title:'create a post',
                success:true,
                data
            })
        } catch (error) {
            console.log(error);
        }

    }
}

module.exports = new NewsAndEvent()