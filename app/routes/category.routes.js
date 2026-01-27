const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isModerator } = require('../middlewares/role.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', categoryController.getAllCategories);
// Protected routes - Admin/Moderator only
router.get('/admin/all', protect, isModerator, categoryController.getAllCategoriesAdmin);

// Public routes (detail)
router.get('/:id', categoryController.getCategoryById);

router.post(
  '/',
  protect,
  isModerator,
  uploadSingle,
  handleUploadError,
  categoryController.createCategory
);

router.put(
  '/:id',
  protect,
  isModerator,
  uploadSingle,
  handleUploadError,
  categoryController.updateCategory
);

router.delete(
  '/:id',
  protect,
  isModerator,
  categoryController.deleteCategory
);

module.exports = router;
