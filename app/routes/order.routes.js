const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// User routes - require authentication
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getMyOrders);

module.exports = router;