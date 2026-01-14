const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { isModerator } = require('../middlewares/role.middleware');
const { uploadMultiple, handleUploadError } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes - Admin/Moderator only
router.post(
  '/',
  protect,
  isModerator,
  uploadMultiple,
  handleUploadError,
  productController.createProduct
);

router.put(
  '/:id',
  protect,
  isModerator,
  uploadMultiple,
  handleUploadError,
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  isModerator,
  productController.deleteProduct
);

module.exports = router;
