const { roles } = require('../config/auth.config');

/**
 * Middleware kiểm tra role của user
 * @param {Array<string>} allowedRoles - Danh sách roles được phép
 * @returns {Function} Middleware function
 */
exports.checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục!'
      });
    }

    // Lấy danh sách role names của user
    const userRoles = req.user.roles.map(role => role.name);

    // Kiểm tra xem user có ít nhất 1 role được phép không
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này!',
        requiredRoles: allowedRoles,
        yourRoles: userRoles
      });
    }

    next();
  };
};

/**
 * Middleware kiểm tra admin (shorthand)
 */
exports.isAdmin = (req, res, next) => {
  return exports.checkRole([roles.ADMIN])(req, res, next);
};

/**
 * Middleware kiểm tra moderator hoặc admin
 */
exports.isModerator = (req, res, next) => {
  return exports.checkRole([roles.MODERATOR, roles.ADMIN])(req, res, next);
};

/**
 * Middleware kiểm tra xem user có sở hữu resource không
 * Dùng cho các trường hợp update/delete profile, orders của chính mình
 */
exports.isOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const resourceUserId = req.params[paramName] || req.body.userId;
    const currentUserId = req.user._id.toString();
    
    // Lấy roles của user
    const userRoles = req.user.roles.map(role => role.name);
    const isAdmin = userRoles.includes(roles.ADMIN);

    // Cho phép nếu là admin hoặc là chính user đó
    if (isAdmin || resourceUserId === currentUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Bạn chỉ có thể thao tác trên tài nguyên của chính mình!'
    });
  };
};