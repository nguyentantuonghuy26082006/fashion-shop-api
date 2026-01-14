const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// ================================================
// MIDDLEWARE: Protect Routes (Require Login)
// FIX: POPULATE ROLES ĐỂ CHECK ROLE
// ================================================
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            console.log('❌ Không có token');
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục!'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
            
            console.log('🔍 Token verified, User ID:', decoded.id);

            // FIX: Get user VÀ POPULATE ROLES
            const user = await User.findById(decoded.id)
                .select('-password')
                .populate('roles');  // ← QUAN TRỌNG! Populate để có role.name

            if (!user) {
                console.log('❌ Không tìm thấy user với ID:', decoded.id);
                return res.status(401).json({
                    success: false,
                    message: 'Người dùng không tồn tại!'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                console.log('❌ User không active:', user.email);
                return res.status(401).json({
                    success: false,
                    message: 'Tài khoản đã bị vô hiệu hóa!'
                });
            }

            console.log('✅ User authenticated:', user.email);
            console.log('🔐 Roles:', user.roles ? user.roles.map(r => r.name).join(', ') : 'NONE');

            // Add user to request
            req.user = user;
            next();

        } catch (jwtError) {
            console.error('❌ JWT Error:', jwtError.name, jwtError.message);
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token không hợp lệ!'
                });
            }
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Xác thực thất bại!'
            });
        }

    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Xác thực thất bại!'
        });
    }
};

// ================================================
// MIDDLEWARE: Admin Only (Require Admin Role)
// FIX: CHECK ROLE.NAME ĐÚNG CÁCH
// ================================================
exports.adminOnly = async (req, res, next) => {
    try {
        console.log('🔐 Checking admin permission...');
        
        // Check if user is authenticated (protect middleware should run first)
        if (!req.user) {
            console.log('❌ Không có user trong request');
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập!'
            });
        }

        console.log('👤 User:', req.user.email);
        console.log('🔐 User roles:', req.user.roles ? req.user.roles.map(r => r.name).join(', ') : 'NONE');

        // Check if user has roles
        if (!req.user.roles || req.user.roles.length === 0) {
            console.log('❌ User không có roles');
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập!'
            });
        }

        // FIX: Check if user has admin role (roles đã được populate)
        const hasAdminRole = req.user.roles.some(role => role.name === 'admin');
        
        if (!hasAdminRole) {
            console.log('❌ User không phải admin');
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập! (Chỉ admin)'
            });
        }

        console.log('✅ User là admin, cho phép truy cập');
        next();

    } catch (error) {
        console.error('❌ Admin middleware error:', error);
        return res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập!'
        });
    }
};

// ================================================
// MIDDLEWARE: Optional Auth (Not Required)
// FIX: POPULATE ROLES NẾU CÓ TOKEN
// ================================================
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
                const user = await User.findById(decoded.id)
                    .select('-password')
                    .populate('roles');  // Populate roles
                
                if (user && user.isActive) {
                    req.user = user;
                    console.log('✅ Optional auth: User authenticated:', user.email);
                }
            } catch (err) {
                // Token invalid, but continue anyway
                console.log('⚠️ Optional auth: Invalid token, continuing without user');
            }
        }

        next();

    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
};
