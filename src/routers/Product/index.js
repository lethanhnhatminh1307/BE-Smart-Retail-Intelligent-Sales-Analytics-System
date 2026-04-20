
const ProductController = require('../../App/controllers/Products/ProductController')
const searchController = require('../../App/controllers/Products/SearchController')
const express = require('express');
const router = express.Router();
const uploadFile = require('../../utils/uploadFiles')
const {employee} = require('../../utils/roles');
const authenToken = require('../../utils/authenToken');
const SuggestController = require('../../App/controllers/Products/SuggestController');


router.post('/upload-product',uploadFile().array('image',10),employee,authenToken,ProductController.uploadProduct)
router.delete('/delete',employee,authenToken,ProductController.delete)  
router.post('/modify',uploadFile().array('image',10),employee,authenToken,ProductController.modify)

router.get('/get-product',ProductController.getProduct) 
router.get('/open-image',ProductController.getImage)
router.get('/get-one-product',ProductController.getOne)
router.get('/get-products',ProductController.get)
router.get('/search',searchController.index)
router.get('/type',ProductController.getType)

router.get('/new-product',SuggestController.newProduct)


module.exports = router
