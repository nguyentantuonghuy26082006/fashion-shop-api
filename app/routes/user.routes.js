const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { isAdmin, isOwnerOrAdmin } = require('../middlewares/role.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

// Protected routes - User's own profile
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, uploadSingle, handleUploadError, userController.updateProfile);
router.put('/change-password', verifyToken, userController.changePassword);

// Admin routes - Manage all users
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.get('/:id', verifyToken, isAdmin, userController.getUserById);
router.put('/:id/role', verifyToken, isAdmin, userController.changeUserRole);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;