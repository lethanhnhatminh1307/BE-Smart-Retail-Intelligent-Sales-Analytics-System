const express = require('express');
const router = express.Router()
const authenToken = require('../../utils/authenToken');
const Bought = require('../../App/controllers/Bought');
const {employee} =  require('../../utils/roles');
const Statistics = require('../../App/controllers/Statistics');

router.get('/my-bought',authenToken,Bought.myBought)
router.get('/all-bought',authenToken,employee,Bought.allBought)

router.post('/list-bought',authenToken,employee,Bought.boughtList)
router.post('/update-status',authenToken,employee,Bought.updateStatus)

router.post('/bought-at-store',Bought.boughtAtStore)
router.get('/get-bill-at-store',Bought.getBillAtStore)
router.get('/get-detail-bill',Bought.getDetailBill)

// statistic

router.get('/overview',Statistics.overView)
router.get('/product',Statistics.product)
router.get('/price-each-years',Statistics.saleInYears)
router.get('/order',Statistics.order)
router.get('/user',Statistics.user)
router.get('/provider',Statistics.provider)


module.exports = router