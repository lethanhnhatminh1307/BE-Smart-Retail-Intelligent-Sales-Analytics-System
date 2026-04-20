const NewsAndEvent = require('../../App/controllers/NewsAndEvent')
const uploadFile = require('../../utils/uploadFiles')

const router = require('express').Router()

router.get('/',NewsAndEvent.show)
router.get('/specify',NewsAndEvent.showSpecify)

router.post('/create',uploadFile().single('image'),NewsAndEvent.addPost)

module.exports = router