const { body } = require('express-validator');

exports.createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên sản phẩm là bắt buộc')
    .isLength({ max: 200 }).withMessage('Tên sản phẩm không được quá 200 ký tự'),

  body('description')
    .trim()
    .notEmpty().withMessage('Mô tả sản phẩm là bắt buộc'),

  body('price')
    .notEmpty().withMessage('Giá sản phẩm là bắt buộc')
    .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),

  body('category')
    .notEmpty().withMessage('Danh mục sản phẩm là bắt buộc')
    .isMongoId().withMessage('ID danh mục không hợp lệ'),

  body('stock')
    .notEmpty().withMessage('Số lượng tồn kho là bắt buộc')
    .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên không âm')
];

exports.updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Tên sản phẩm không được quá 200 ký tự'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên không âm')
];