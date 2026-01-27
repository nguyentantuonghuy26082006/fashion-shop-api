// ============================================
// SERVER.JS - ENTRY POINT CHÍNH CỦA ỨNG DỤNG
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import config
const connectDB = require('./app/config/database');

// Import routes
const authRoutes = require('./app/routes/auth.routes');
const userRoutes = require('./app/routes/user.routes');
const productRoutes = require('./app/routes/product.routes');
const categoryRoutes = require('./app/routes/category.routes');
const cartRoutes = require('./app/routes/cart.routes');
const orderRoutes = require('./app/routes/order.routes');
const adminRoutes = require('./app/routes/admin.routes');

// Import error middleware
const errorHandler = require('./app/middlewares/error.middleware');

// Khởi tạo Express app
const app = express();

// ===== KẾT NỐI DATABASE =====
connectDB();

// ===== SECURITY MIDDLEWARES =====
// FIX: Cấu hình Helmet cho phép hiển thị ảnh từ mọi nguồn
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },  // Cho phép load ảnh cross-origin
  crossOriginEmbedderPolicy: false,  // Tắt để cho phép embed resources
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "*"],  // Cho phép ảnh từ mọi nguồn
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "http://localhost:*", "https://*"],
    },
  },
}));

// FIX: CORS - Cho phép frontend kết nối từ nhiều nguồn
app.use(cors({
  origin: function(origin, callback) {
    // Cho phép requests không có origin (như mobile apps, Postman)
    // và các origins từ localhost
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5500',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5500',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Cho phép tất cả trong development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - Giới hạn số request để chống brute-force
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 phút
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Giới hạn 100 requests/15 phút
  message: 'Quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút'
});
app.use('/api/', limiter);

// ===== BODY PARSER MIDDLEWARES =====
app.use(express.json({ limit: '10mb' })); // Parse JSON body
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded body

// ===== COMPRESSION =====
app.use(compression()); // Nén response để tăng tốc độ

// ===== LOGGING =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log chi tiết trong dev mode
} else {
  app.use(morgan('combined')); // Log ngắn gọn trong production
}

// ===== STATIC FILES =====
// FIX: Phục vụ file tĩnh với headers cho phép cross-origin
// Serve cả thư mục uploads và uploads/products
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Đảm bảo tạo thư mục uploads/products nếu chưa có
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ===== ROUTES =====
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server đang hoạt động tốt!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chào mừng đến với Fashion Shop API!',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// 404 Handler - Route không tồn tại
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tồn tại!`
  });
});

// ===== ERROR HANDLING MIDDLEWARE =====
// Middleware xử lý lỗi tập trung (phải để cuối cùng)
app.use(errorHandler);

// ===== KHỞI ĐỘNG SERVER =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚀 FASHION SHOP SERVER ĐANG CHẠY                   ║
  ║                                                        ║
  ║   🔌 Port: ${PORT}                                    ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║   🔗 URL: http://localhost:${PORT}                   ║
  ║   📚 API Docs: http://localhost:${PORT}/api/docs     ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

// Xử lý unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Xử lý uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;