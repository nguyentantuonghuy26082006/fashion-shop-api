const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin, isOwnerOrAdmin } = require('../middlewares/role.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

// Protected routes - User's own profile
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, uploadSingle, handleUploadError, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

// Admin routes - Manage all users
router.get('/', protect, isAdmin, userController.getAllUsers);
router.get('/:id', protect, isAdmin, userController.getUserById);
router.put('/:id/role', protect, isAdmin, userController.changeUserRole);
router.delete('/:id', protect, isAdmin, userController.deleteUser);

module.exports = router;