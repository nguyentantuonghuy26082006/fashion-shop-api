const { body } = require('express-validator');

exports.signupValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Họ tên là bắt buộc')
    .isLength({ min: 3 }).withMessage('Họ tên phải có ít nhất 3 ký tự'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa chữ hoa, chữ thường và số'),

  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ')
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
];
