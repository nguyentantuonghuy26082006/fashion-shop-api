const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// ================================================
// USER ROUTES
// ================================================
router.post('/', protect, orderController.createOrder);
router.get('/', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/cancel', protect, orderController.cancelOrder);

// ================================================
// ADMIN ROUTES
// ================================================
router.get('/admin/all', protect, adminOnly, orderController.getAllOrders);
router.get('/admin/:id', protect, adminOnly, orderController.getOrderByIdAdmin); // ← THÊM DÒNG NÀY
router.put('/admin/:id/status', protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;