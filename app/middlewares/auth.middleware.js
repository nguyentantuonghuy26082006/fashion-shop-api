const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { jwt: jwtConfig } = require('../config/auth.config');

/**
 * Middleware xác thực JWT token
 * Kiểm tra Bearer token trong header Authorization
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập!'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Tìm user và populate roles
    const user = await User.findById(decoded.id)
      .populate('roles', 'name')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị xóa'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị vô hiệu hóa'
      });
    }

    // Gắn user vào request để sử dụng ở các middleware/controller sau
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại!'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ!'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực token',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra token (optional - không bắt buộc đăng nhập)
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await User.findById(decoded.id)
        .populate('roles', 'name')
        .select('-password -refreshToken');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Nếu có lỗi, vẫn cho tiếp tục (vì optional)
    next();
  }
};