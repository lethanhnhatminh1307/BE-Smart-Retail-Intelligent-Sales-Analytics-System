const express = require('express')

const authenToken = require('../../utils/authenToken')
const FeedbackController = require('../../App/controllers/FeedbackController')
const { employee } = require('../../utils/roles')
const router = express.Router()

router.get('/show',FeedbackController.show)

router.post('/write',authenToken,FeedbackController.write)
router.post('/reply',authenToken,employee,FeedbackController.reply)

module.exports = router