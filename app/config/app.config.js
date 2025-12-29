module.exports = {
  // Pagination mặc định
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100
  },

  // Upload file
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    uploadDir: 'uploads/products'
  },

  // Order status
  orderStatus: {
    PENDING: 'pending', // Đang chờ xử lý
    CONFIRMED: 'confirmed', // Đã xác nhận
    PROCESSING: 'processing', // Đang xử lý
    SHIPPING: 'shipping', // Đang giao hàng
    DELIVERED: 'delivered', // Đã giao hàng
    CANCELLED: 'cancelled', // Đã hủy
    RETURNED: 'returned' // Đã hoàn trả
  },

  // Payment methods
  paymentMethods: {
    COD: 'cod', // Thanh toán khi nhận hàng
    BANK_TRANSFER: 'bank_transfer', // Chuyển khoản
    CREDIT_CARD: 'credit_card', // Thẻ tín dụng
    E_WALLET: 'e_wallet' // Ví điện tử
  },

  // Product filters
  productFilters: {
    sortBy: {
      NEWEST: 'createdAt',
      PRICE_ASC: 'price',
      PRICE_DESC: '-price',
      NAME_ASC: 'name',
      BESTSELLER: 'soldCount'
    }
  }
};