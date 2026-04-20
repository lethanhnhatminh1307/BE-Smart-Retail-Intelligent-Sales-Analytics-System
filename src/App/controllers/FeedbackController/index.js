const Feedback = require('../../models/Feedback')

class FeedbackController{
   async show(req, res, next){
        try {
            const idProduct = req.query?.idProduct
            const data = await Feedback.find({idProduct:idProduct}).populate('userID','name userName avatar').sort({createdAt:-1})
            res.status(200).json({
                title:'show feedback',
                success:true,
                data
            })
        } catch (error) {
            console.log(error);
        }
   }

   async write(req, res, next) {
    try {
       const {id,message,starNumber,idProduct} = req.body
       const newFeedback = new Feedback({userID:id,message,starNumber:starNumber*1,idProduct})
        const data  = await newFeedback.save()
        const newData = await data.populate('userID','userName name avatar')
        res.status(200).json({
            title:'creating feedback',
            success:true,
            data:newData
        })
    } catch (error) {
        console.log(error);
    }
   }

   async reply(req, res) {
        try {
            const idFeedback = req.body.idFeedback
            const message = req.body.message
            const feedbackUpdate = await Feedback.updateOne({_id:idFeedback},{ $push: { reply: { $each: [message], $position: 0 } } })
            return res.status(200).json({
                title:'reply',
                success:true,
                data:feedbackUpdate
            })
        } catch (error) {
            console.log(error);
        }
   }
}

module.exports = new FeedbackController();
