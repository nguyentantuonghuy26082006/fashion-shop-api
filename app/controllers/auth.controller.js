const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const { jwt: jwtConfig, roles } = require('../config/auth.config');

/**
 * Tạo JWT Access Token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

/**
 * Tạo JWT Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );
};

/**
 * @route   POST /api/auth/signup
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký!'
      });
    }

    // Tìm role 'user' (role mặc định)
    let userRole = await Role.findOne({ name: roles.USER });
    
    // Nếu chưa có role 'user', tạo mới
    if (!userRole) {
      userRole = await Role.create({
        name: roles.USER,
        description: 'Người dùng thông thường'
      });
    }

    // Tạo user mới
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      roles: [userRole._id]
    });

    // Tạo tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Lưu refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Populate roles trước khi trả về
    await user.populate('roles', 'name');

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          roles: user.roles.map(r => r.name)
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user (kèm password để so sánh)
    const user = await User.findOne({ email })
      .select('+password')
      .populate('roles', 'name');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng!'
      });
    }

    // Kiểm tra tài khoản có active không
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị vô hiệu hóa!'
      });
    }

    // So sánh mật khẩu
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng!'
      });
    }

    // Tạo tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Lưu refresh token và last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          roles: user.roles.map(r => r.name)
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Làm mới access token bằng refresh token
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token là bắt buộc!'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

    // Tìm user
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ!'
      });
    }

    // Tạo access token mới
    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Làm mới token thành công!',
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại!'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi làm mới token',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất (xóa refresh token)
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    // Xóa refresh token
    const user = await User.findById(req.user._id);
    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng xuất',
      error: error.message
    });
  }
};