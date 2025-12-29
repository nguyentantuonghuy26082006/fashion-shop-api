const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * @route   GET /api/users/profile
 * @desc    Xem profile của user đang đăng nhập
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('roles', 'name description');

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
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

    const user = await User.findById(req.user._id);

    // Cập nhật các field được phép
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // Nếu có upload avatar
    if (req.file) {
      // Xóa ảnh cũ trên Cloudinary (nếu có)
      if (user.avatar.public_id) {
        await deleteFromCloudinary(user.avatar.public_id);
      }

      // Upload ảnh mới
      const result = await uploadToCloudinary(req.file.path, 'fashion-shop/avatars');
      user.avatar = {
        public_id: result.public_id,
        url: result.url
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật profile thành công!',
      data: user
    });

  } catch (error) {
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

    const user = await User.findById(req.user._id).select('+password');

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng!'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });

  } catch (error) {
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
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
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
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách users',
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
        message: 'Không tìm thấy user!'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin user',
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
    const { roles: roleNames } = req.body; // ["user", "moderator"]

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user!'
      });
    }

    // Tìm các role documents
    const roleDocuments = await Role.find({ name: { $in: roleNames } });

    if (roleDocuments.length !== roleNames.length) {
      return res.status(400).json({
        success: false,
        message: 'Một số role không tồn tại!'
      });
    }

    // Cập nhật roles
    user.roles = roleDocuments.map(r => r._id);
    await user.save();

    await user.populate('roles', 'name');

    res.status(200).json({
      success: true,
      message: 'Cập nhật role thành công!',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thay đổi role',
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
        message: 'Không tìm thấy user!'
      });
    }

    // Không cho phép xóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa chính mình!'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa user thành công!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa user',
      error: error.message
    });
  }
};