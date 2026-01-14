const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Get cart
router.get('/', cartController.getCart);

// Add to cart
router.post('/add', cartController.addToCart);

// Update cart item
router.put('/update/:itemId', cartController.updateCartItem);

// Remove cart item
router.delete('/remove/:itemId', cartController.removeCartItem);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;
