const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    minlength: [3, 'Họ tên phải có ít nhất 3 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  phone: {
    type: String,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/default-avatar.png'
    }
  },
  address: {
    street: String,
    city: String,
    district: String,
    ward: String,
    zipCode: String
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: [] // Sẽ gán role 'user' khi đăng ký
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date
}, {
  timestamps: true
});

// Index để tăng tốc tìm kiếm
userSchema.index({ email: 1 });

// Middleware: Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ mã hóa nếu password bị thay đổi
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: So sánh mật khẩu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual: Kiểm tra role
userSchema.methods.hasRole = function(roleName) {
  return this.roles.some(role => role.name === roleName);
};

module.exports = mongoose.model('User', userSchema);