const { roles } = require('../config/auth.config');

/**
 * Middleware kiểm tra role của user
 * @param {Array<string>} allowedRoles - Danh sách roles được phép
 * @returns {Function} Middleware function
 * 
 * FIX: Handle cả ObjectId (đã populate) VÀ string array
 */
exports.checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ checkRole: Không có user trong request');
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục!'
      });
    }

    if (!req.user.roles || req.user.roles.length === 0) {
      console.log('❌ checkRole: User không có roles');
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này!'
      });
    }

    // FIX: Lấy danh sách role names (handle cả ObjectId và string)
    let userRoles;
    
    if (typeof req.user.roles[0] === 'object' && req.user.roles[0].name) {
      // Roles đã được populate (ObjectId)
      userRoles = req.user.roles.map(role => role.name);
    } else {
      // Roles là string array
      userRoles = req.user.roles;
    }

    console.log('🔐 checkRole: User roles:', userRoles.join(', '));
    console.log('🔐 checkRole: Allowed roles:', allowedRoles.join(', '));

    // Kiểm tra xem user có ít nhất 1 role được phép không
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      console.log('❌ checkRole: Không đủ quyền');
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này!',
        requiredRoles: allowedRoles,
        yourRoles: userRoles
      });
    }

    console.log('✅ checkRole: User có quyền truy cập');
    next();
  };
};

/**
 * Middleware kiểm tra admin (shorthand)
 */
exports.isAdmin = (req, res, next) => {
  console.log('🔐 Checking admin permission...');
  
  if (!req.user) {
    console.log('❌ isAdmin: Không có user');
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập!'
    });
  }

  if (!req.user.roles || req.user.roles.length === 0) {
    console.log('❌ isAdmin: User không có roles');
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập!'
    });
  }

  // FIX: Handle cả ObjectId và string
  let userRoles;
  if (typeof req.user.roles[0] === 'object' && req.user.roles[0].name) {
    userRoles = req.user.roles.map(role => role.name);
  } else {
    userRoles = req.user.roles;
  }

  console.log('🔐 isAdmin: User roles:', userRoles.join(', '));

  const isAdmin = userRoles.includes(roles.ADMIN);

  if (!isAdmin) {
    console.log('❌ isAdmin: User không phải admin');
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập! (Chỉ admin)'
    });
  }

  console.log('✅ isAdmin: User là admin');
  next();
};

/**
 * Middleware kiểm tra moderator hoặc admin
 */
exports.isModerator = (req, res, next) => {
  console.log('🔐 Checking moderator/admin permission...');
  return exports.checkRole([roles.MODERATOR, roles.ADMIN])(req, res, next);
};

/**
 * Middleware kiểm tra xem user có sở hữu resource không
 * Dùng cho các trường hợp update/delete profile, orders của chính mình
 */
exports.isOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ isOwnerOrAdmin: Không có user');
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập!'
      });
    }

    const resourceUserId = req.params[paramName] || req.body.userId;
    const currentUserId = req.user._id.toString();
    
    // FIX: Handle cả ObjectId và string
    let userRoles;
    if (req.user.roles && req.user.roles.length > 0) {
      if (typeof req.user.roles[0] === 'object' && req.user.roles[0].name) {
        userRoles = req.user.roles.map(role => role.name);
      } else {
        userRoles = req.user.roles;
      }
    } else {
      userRoles = [];
    }

    const isAdmin = userRoles.includes(roles.ADMIN);

    console.log('🔐 isOwnerOrAdmin: Resource user ID:', resourceUserId);
    console.log('🔐 isOwnerOrAdmin: Current user ID:', currentUserId);
    console.log('🔐 isOwnerOrAdmin: Is admin:', isAdmin);

    // Cho phép nếu là admin hoặc là chính user đó
    if (isAdmin || resourceUserId === currentUserId) {
      console.log('✅ isOwnerOrAdmin: Cho phép truy cập');
      return next();
    }

    console.log('❌ isOwnerOrAdmin: Không có quyền');
    return res.status(403).json({
      success: false,
      message: 'Bạn chỉ có thể thao tác trên tài nguyên của chính mình!'
    });
  };
};
