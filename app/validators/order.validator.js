const { body } = require('express-validator');

exports.createOrderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),

  body('items.*.productId')
    .notEmpty().withMessage('ID sản phẩm là bắt buộc')
    .isMongoId().withMessage('ID sản phẩm không hợp lệ'),

  body('items.*.quantity')
    .notEmpty().withMessage('Số lượng là bắt buộc')
    .isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),

  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Họ tên người nhận là bắt buộc'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Số điện thoại người nhận là bắt buộc')
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),

  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Địa chỉ là bắt buộc'),

  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('Thành phố là bắt buộc'),

  body('paymentMethod')
    .notEmpty().withMessage('Phương thức thanh toán là bắt buộc')
    .isIn(['cod', 'bank_transfer', 'credit_card', 'e_wallet'])
    .withMessage('Phương thức thanh toán không hợp lệ')
];