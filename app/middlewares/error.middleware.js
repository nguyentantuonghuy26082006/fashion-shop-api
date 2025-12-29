/**
 * Error handler middleware tập trung
 * Phải đặt cuối cùng trong chain middlewares
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Lỗi Mongoose Validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Lỗi validation',
      errors: errors
    });
  }

  // Lỗi Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} đã tồn tại trong hệ thống`
    });
  }

  // Lỗi Mongoose Cast Error (ID không hợp lệ)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ'
    });
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token đã hết hạn'
    });
  }

  // Lỗi mặc định
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi server nội bộ';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;