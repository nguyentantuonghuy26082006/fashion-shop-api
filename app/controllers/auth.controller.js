const User = require('../models/user.model');
const Role = require('../models/role.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ================================================
// GENERATE JWT TOKEN
// ================================================
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fashion-shop-secret-key-2024', {
        expiresIn: '30d'
    });
};

// ================================================
// REGISTER / SIGNUP
// ================================================
exports.signup = async (req, res) => {
    try {
        console.log('\n========================================');
        console.log('📝 ĐĂNG KÝ TÀI KHOẢN');
        console.log('========================================');
        console.log('📧 Email:', req.body.email);
        console.log('👤 Họ tên:', req.body.fullName);
        
        const { fullName, email, password, phone } = req.body;

        // ================================================
        // VALIDATION
        // ================================================
        if (!fullName || !email || !password) {
            console.log('❌ Thiếu thông tin bắt buộc');
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin!'
            });
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Email không hợp lệ');
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ!'
            });
        }

        // Check password length
        if (password.length < 6) {
            console.log('❌ Mật khẩu quá ngắn');
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự!'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            console.log('❌ Email đã tồn tại');
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng!'
            });
        }

        console.log('✅ Validation passed');

        // ================================================
        // TÌM HOẶC TẠO ROLE "user"
        // ================================================
        console.log('🔍 Tìm role "user" trong database...');
        let userRole = await Role.findOne({ name: 'user' });
        
        if (!userRole) {
            console.log('⚠️  Không tìm thấy role "user", tạo mới...');
            userRole = await Role.create({
                name: 'user',
                description: 'Người dùng thông thường'
            });
            console.log('✅ Đã tạo role "user":', userRole._id);
        } else {
            console.log('✅ Tìm thấy role "user":', userRole._id);
        }

        // ================================================
        // TẠO USER (KHÔNG HASH Ở ĐÂY - Model sẽ tự hash)
        // ================================================
        // QUAN TRỌNG: Không hash password ở đây!
        // User model có pre-save middleware sẽ tự động hash
        const user = await User.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: password,  // ← KHÔNG HASH - để model tự hash
            phone: phone || '',
            roles: [userRole._id],
            isActive: true
        });

        console.log('✅ User đã tạo:', user._id);

        // Generate token
        const token = generateToken(user._id);

        // Populate roles để trả về
        await user.populate('roles', 'name');

        console.log('========================================');
        console.log('✅ ĐĂNG KÝ THÀNH CÔNG');
        console.log('👤 User ID:', user._id);
        console.log('📧 Email:', user.email);
        console.log('🔐 Roles:', user.roles.map(r => r.name).join(', '));
        console.log('========================================\n');

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            data: {
                accessToken: token,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    roles: user.roles.map(r => r.name)
                }
            }
        });

    } catch (error) {
        console.error('\n========================================');
        console.error('❌ LỖI ĐĂNG KÝ');
        console.error('========================================');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('========================================\n');
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng!'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng ký: ' + error.message
        });
    }
};

// ================================================
// LOGIN
// ================================================
exports.login = async (req, res) => {
    try {
        console.log('\n========================================');
        console.log('🔐 ĐĂNG NHẬP');
        console.log('========================================');
        console.log('📧 Email:', req.body.email);
        
        const { email, password } = req.body;

        // ================================================
        // VALIDATION
        // ================================================
        if (!email || !password) {
            console.log('❌ Thiếu email hoặc password');
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu!'
            });
        }

        console.log('✅ Email và password đã được cung cấp');

        // ================================================
        // TÌM USER
        // ================================================
        console.log('🔍 Tìm user trong database...');
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password')
            .populate('roles', 'name');
        
        if (!user) {
            console.log('❌ Không tìm thấy user với email:', email);
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng!'
            });
        }

        console.log('✅ Tìm thấy user:', user._id);
        console.log('📝 User có password:', user.password ? 'CÓ' : 'KHÔNG');
        
        // Check if password exists
        if (!user.password) {
            console.error('❌ LỖI: User không có password trong database!');
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống: Tài khoản không hợp lệ!'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            console.log('❌ Tài khoản đã bị vô hiệu hóa');
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa!'
            });
        }

        // ================================================
        // SO SÁNH PASSWORD
        // ================================================
        console.log('🔍 So sánh password...');
        
        // Sử dụng method của model hoặc bcrypt trực tiếp
        let isMatch = false;
        
        if (typeof user.comparePassword === 'function') {
            isMatch = await user.comparePassword(password);
        } else {
            isMatch = await bcrypt.compare(password, user.password);
        }
        
        console.log('🔐 Kết quả so sánh password:', isMatch ? 'ĐÚNG ✅' : 'SAI ❌');
        
        if (!isMatch) {
            console.log('❌ Password không khớp');
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng!'
            });
        }

        console.log('✅ Password khớp!');

        // ================================================
        // TẠO TOKEN VÀ CẬP NHẬT LAST LOGIN
        // ================================================
        const token = generateToken(user._id);
        console.log('✅ Token đã tạo');

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Get role names
        const roleNames = user.roles ? user.roles.map(r => r.name) : ['user'];

        console.log('========================================');
        console.log('✅ ĐĂNG NHẬP THÀNH CÔNG');
        console.log('👤 User ID:', user._id);
        console.log('📧 Email:', user.email);
        console.log('🔐 Roles:', roleNames.join(', '));
        console.log('⏰ Token expire: 30 ngày');
        console.log('========================================\n');

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            data: {
                accessToken: token,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    roles: roleNames
                }
            }
        });

    } catch (error) {
        console.error('\n========================================');
        console.error('❌ LỖI ĐĂNG NHẬP');
        console.error('========================================');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('========================================\n');
        
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng nhập: ' + error.message
        });
    }
};

// ================================================
// GET CURRENT USER (ME)
// ================================================
exports.getMe = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        console.log('📋 GET ME - User ID:', userId);
        
        const user = await User.findById(userId)
            .select('-password -refreshToken')
            .populate('roles', 'name');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        console.log('✅ Tìm thấy user:', user.email);

        const roleNames = user.roles ? user.roles.map(r => r.name) : ['user'];

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                roles: roleNames,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin người dùng!'
        });
    }
};

// ================================================
// UPDATE PROFILE
// ================================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { fullName, phone } = req.body;

        const user = await User.findById(userId).populate('roles', 'name');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        if (fullName) user.fullName = fullName.trim();
        if (phone) user.phone = phone;

        await user.save({ validateBeforeSave: false });

        console.log('✅ Đã cập nhật profile:', user.email);

        const roleNames = user.roles ? user.roles.map(r => r.name) : ['user'];

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công!',
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                roles: roleNames
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật thông tin!'
        });
    }
};

// ================================================
// CHANGE PASSWORD
// ================================================
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin!'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự!'
            });
        }

        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng!'
            });
        }

        // Cập nhật mật khẩu mới (model sẽ tự hash)
        user.password = newPassword;
        await user.save();

        console.log('✅ Đã đổi mật khẩu:', user.email);

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công!'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đổi mật khẩu!'
        });
    }
};

// ================================================
// LOGOUT (Optional - chủ yếu xử lý ở frontend)
// ================================================
exports.logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Đăng xuất thành công!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng xuất!'
        });
    }
};