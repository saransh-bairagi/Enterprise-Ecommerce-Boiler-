const router = require('express').Router();
const AddressController = require('./address.controller');
const { auth } = require('../../common middlewares/auth');

router.post('/', auth, AddressController.create);
router.get('/', auth, AddressController.list);
router.get('/:id', auth, AddressController.get);
router.put('/:id', auth, AddressController.update);
router.delete('/:id', auth, AddressController.delete);

module.exports = router;
