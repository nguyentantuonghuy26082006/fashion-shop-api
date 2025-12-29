const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);

module.exports = router;