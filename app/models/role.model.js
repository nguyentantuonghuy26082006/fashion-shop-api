const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên vai trò là bắt buộc'],
    enum: ['user', 'moderator', 'admin'],
    unique: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);