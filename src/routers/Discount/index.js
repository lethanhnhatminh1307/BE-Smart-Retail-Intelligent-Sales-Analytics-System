const express = require('express');
const router = express.Router();
const DiscountController = require('../../App/controllers/Discount/DiscountController');

router.post('/', DiscountController.create.bind(DiscountController));
router.get('/', DiscountController.getAll.bind(DiscountController));
router.get('/code/:code', DiscountController.getByCode.bind(DiscountController));
router.get('/:id', DiscountController.getById.bind(DiscountController));
router.put('/:id', DiscountController.update.bind(DiscountController));
router.delete('/:id', DiscountController.delete.bind(DiscountController));

module.exports = router;
