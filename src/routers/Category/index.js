const router  = require('express').Router();
const Category = require('../../App/controllers/Category')
const authenToken = require('../../utils/authenToken');
const {employee} = require('../../utils/roles');

router.get('/',Category.show)
router.post('/create',authenToken,employee,Category.create)
router.delete('/delete',authenToken,employee,Category.delete)
router.post('/replace',authenToken,employee,Category.replace)

module.exports = router