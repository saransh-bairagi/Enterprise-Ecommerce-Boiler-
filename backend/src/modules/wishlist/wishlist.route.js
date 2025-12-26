const router = require('express').Router();
const WishlistController = require('./wishlist.controller');
const { auth } = require('../../common middlewares/auth');

router.get('/', auth, WishlistController.get);
router.post('/add', auth, WishlistController.add);
router.post('/remove', auth, WishlistController.remove);
router.delete('/:id', auth, WishlistController.delete);

module.exports = router;
