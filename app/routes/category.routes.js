const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { isModerator } = require('../middlewares/role.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', categoryController.getAllCategories);

// Protected routes - Admin/Moderator only
router.post(
  '/',
  verifyToken,
  isModerator,
  uploadSingle,
  handleUploadError,
  categoryController.createCategory
);

module.exports = router;