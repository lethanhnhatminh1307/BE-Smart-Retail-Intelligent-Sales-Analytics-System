const Bill = require('../../App/controllers/Bill')
const { employee } = require('../../utils/roles');
const authenToken = require('../../utils/authenToken');
const route = require('express').Router()

route.get('/show-bill',authenToken,employee,Bill.showBill)
route.get('/show-add-product',authenToken,Bill.showAddProduct)
route.get('/show-export-bill',authenToken,employee,Bill.exportBill)
route.get('/show-specify-bill',authenToken,employee,Bill.showSpecifyBill)
route.get('/show-inventory',authenToken,employee,Bill.showinventory)
route.post('/create',authenToken,employee,Bill.create)

route.get('/set',Bill.set)




module.exports = route