const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/statistics', adminController.getStatistics);
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
