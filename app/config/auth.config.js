module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  },

  // Roles trong hệ thống
  roles: {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin'
  },

  // Quyền hạn của từng role
  permissions: {
    user: [
      'read:products',
      'read:categories',
      'manage:own-cart',
      'manage:own-orders',
      'update:own-profile'
    ],
    moderator: [
      'read:products',
      'create:products',
      'update:products',
      'delete:products',
      'manage:categories'
    ],
    admin: [
      'manage:all', // Có tất cả quyền
      'manage:users',
      'manage:orders',
      'view:statistics'
    ]
  }
};