const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { signupValidation, loginValidation } = require('../validators/auth.validator');
const { validate } = require('../middlewares/validate.middleware');

// Public routes
router.post('/signup', signupValidation, validate, authController.signup);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', verifyToken, authController.logout);

module.exports = router;