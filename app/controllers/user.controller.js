const User = require('../models/user.model');
const Role = require('../models/role.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/users/profile
 * @desc    Xem profile của user đang đăng nhập
 * @access  Private
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id || req.user.id)
            .populate('roles', 'name description')
            .select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin profile',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Cập nhật profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone, address } = req.body;

        const user = await User.findById(req.user._id || req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        // Cập nhật các field được phép
        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        // Nếu có upload avatar
        if (req.file) {
            try {
                // Xóa ảnh cũ trên Cloudinary (nếu có)
                if (user.avatar && user.avatar.public_id) {
                    await deleteFromCloudinary(user.avatar.public_id);
                }

                // Upload ảnh mới
                const result = await uploadToCloudinary(req.file.path, 'fashion-shop/avatars');
                user.avatar = {
                    public_id: result.public_id,
                    url: result.url
                };
            } catch (uploadError) {
                console.error('Error uploading avatar:', uploadError);
                // Continue without avatar update
            }
        }

        await user.save();

        // Populate roles for response
        await user.populate('roles', 'name');

        res.status(200).json({
            success: true,
            message: 'Cập nhật profile thành công!',
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                roles: user.roles.map(r => r.name)
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật profile',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/users/change-password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự!'
            });
        }

        const user = await User.findById(req.user._id || req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng!'
            });
        }

        // Hash và cập nhật mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công!'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đổi mật khẩu',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/users
 * @desc    Lấy danh sách tất cả users (Admin only)
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        console.log('📋 Admin lấy danh sách users');
        
        const { page = 1, limit = 100, search, role, isActive } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        // Nếu filter theo role
        if (role) {
            const roleDoc = await Role.findOne({ name: role });
            if (roleDoc) {
                query.roles = roleDoc._id;
            }
        }

        const users = await User.find(query)
            .populate('roles', 'name')
            .select('-password -refreshToken')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        // Transform users để frontend dễ xử lý
        const transformedUsers = users.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || '',
            avatar: user.avatar,
            roles: user.roles ? user.roles.map(r => r.name) : ['user'],
            isActive: user.isActive !== false,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));

        console.log(`✅ Tìm thấy ${total} users`);

        res.status(200).json({
            success: true,
            data: transformedUsers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách người dùng',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/users/:id
 * @desc    Lấy thông tin user theo ID (Admin only)
 * @access  Private/Admin
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('roles', 'name description')
            .select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                roles: user.roles ? user.roles.map(r => r.name) : ['user'],
                isActive: user.isActive,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin người dùng',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/users/:id/role
 * @desc    Thay đổi role của user (Admin only)
 * @access  Private/Admin
 */
exports.changeUserRole = async (req, res) => {
    try {
        const { roles: roleNames } = req.body; // ["user", "admin"]

        if (!roleNames || !Array.isArray(roleNames)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp danh sách roles!'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        // Tìm các role documents
        const roleDocuments = await Role.find({ name: { $in: roleNames } });

        if (roleDocuments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy role hợp lệ!'
            });
        }

        // Cập nhật roles
        user.roles = roleDocuments.map(r => r._id);
        await user.save();

        await user.populate('roles', 'name');

        console.log(`✅ Đã cập nhật role cho user ${user.email}:`, roleNames);

        res.status(200).json({
            success: true,
            message: 'Cập nhật quyền thành công!',
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                roles: user.roles.map(r => r.name)
            }
        });

    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi thay đổi quyền',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/users/:id/status
 * @desc    Thay đổi trạng thái user (Admin only)
 * @access  Private/Admin
 */
exports.changeUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        // Không cho phép vô hiệu hóa chính mình
        if (user._id.toString() === (req.user._id || req.user.id).toString()) {
            return res.status(400).json({
                success: false,
                message: 'Không thể thay đổi trạng thái của chính mình!'
            });
        }

        user.isActive = isActive;
        await user.save();

        console.log(`✅ Đã cập nhật trạng thái user ${user.email}: ${isActive ? 'Hoạt động' : 'Ngưng hoạt động'}`);

        res.status(200).json({
            success: true,
            message: `Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản!`,
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('Error changing user status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi thay đổi trạng thái',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Xóa user (Admin only)
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        // Không cho phép xóa chính mình
        if (user._id.toString() === (req.user._id || req.user.id).toString()) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa chính mình!'
            });
        }

        // Xóa avatar trên Cloudinary nếu có
        if (user.avatar && user.avatar.public_id) {
            try {
                await deleteFromCloudinary(user.avatar.public_id);
            } catch (err) {
                console.log('Bỏ qua lỗi xóa avatar:', err.message);
            }
        }

        await user.deleteOne();

        console.log(`✅ Đã xóa user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công!'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa người dùng',
            error: error.message
        });
    }
};