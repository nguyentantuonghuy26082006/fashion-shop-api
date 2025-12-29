// ================================================
// tests/api.test.js - UNIT TESTS (OPTIONAL)
// ================================================

/**
 * LƯU Ý: File này là OPTIONAL cho đồ án
 * Chỉ cần nếu giảng viên yêu cầu unit testing
 * Hoặc bạn muốn bonus điểm
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Test data
let adminToken;
let userToken;
let testProductId;
let testCategoryId;

// Setup: Kết nối DB trước khi test
beforeAll(async () => {
  // Kết nối test database
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fashion_shop_test');
});

// Cleanup: Đóng kết nối sau khi test xong
afterAll(async () => {
  await mongoose.connection.close();
});

// ================================================
// TEST SUITE 1: AUTHENTICATION
// ================================================
describe('Authentication Tests', () => {
  
  // Test 1: Đăng ký user mới
  test('POST /api/auth/signup - Đăng ký thành công', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Test User',
        email: `test${Date.now()}@example.com`, // Email unique
        password: 'Test@123',
        phone: '0123456789'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data.user).toHaveProperty('email');
  });

  // Test 2: Đăng ký với email đã tồn tại
  test('POST /api/auth/signup - Email đã tồn tại', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Test User',
        email: 'admin@fashionshop.com', // Email đã tồn tại
        password: 'Test@123'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 3: Đăng nhập admin
  test('POST /api/auth/login - Đăng nhập admin thành công', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@fashionshop.com',
        password: 'Admin@123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
    
    // Lưu token để dùng cho tests sau
    adminToken = response.body.data.accessToken;
  });

  // Test 4: Đăng nhập user thường
  test('POST /api/auth/login - Đăng nhập user thành công', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'User@123'
      });

    expect(response.status).toBe(200);
    userToken = response.body.data.accessToken;
  });

  // Test 5: Đăng nhập sai mật khẩu
  test('POST /api/auth/login - Sai mật khẩu', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@fashionshop.com',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

// ================================================
// TEST SUITE 2: PRODUCTS
// ================================================
describe('Product Tests', () => {

  // Test 6: Tạo category trước (cần cho product)
  test('POST /api/categories - Tạo category (Admin)', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Category',
        description: 'Test description'
      });

    expect(response.status).toBe(201);
    testCategoryId = response.body.data._id;
  });

  // Test 7: Lấy danh sách products (public)
  test('GET /api/products - Lấy danh sách sản phẩm', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // Test 8: Tạo product (Admin only)
  test('POST /api/products - Tạo sản phẩm (Admin)', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        description: 'Test product description',
        price: 199000,
        category: testCategoryId,
        stock: 100,
        brand: 'Test Brand'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    testProductId = response.body.data._id;
  });

  // Test 9: User không thể tạo product
  test('POST /api/products - User không có quyền tạo', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Product',
        description: 'Test',
        price: 100000,
        category: testCategoryId,
        stock: 50
      });

    expect(response.status).toBe(403); // Forbidden
    expect(response.body.success).toBe(false);
  });

  // Test 10: Lấy chi tiết product
  test('GET /api/products/:id - Lấy chi tiết sản phẩm', async () => {
    const response = await request(app)
      .get(`/api/products/${testProductId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('name');
    expect(response.body.data).toHaveProperty('price');
  });

  // Test 11: Update product (Admin)
  test('PUT /api/products/:id - Cập nhật sản phẩm (Admin)', async () => {
    const response = await request(app)
      .put(`/api/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Product Name',
        price: 299000
      });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated Product Name');
  });

  // Test 12: Search products
  test('GET /api/products?search=test - Tìm kiếm sản phẩm', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ search: 'test' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Test 13: Filter by price
  test('GET /api/products?minPrice=100000&maxPrice=500000', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ minPrice: 100000, maxPrice: 500000 });

    expect(response.status).toBe(200);
    response.body.data.forEach(product => {
      expect(product.price).toBeGreaterThanOrEqual(100000);
      expect(product.price).toBeLessThanOrEqual(500000);
    });
  });
});

// ================================================
// TEST SUITE 3: CART & ORDERS
// ================================================
describe('Cart & Order Tests', () => {

  // Test 14: Xem giỏ hàng (cần auth)
  test('GET /api/cart - Xem giỏ hàng', async () => {
    const response = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Test 15: Thêm vào giỏ hàng
  test('POST /api/cart/add - Thêm sản phẩm vào giỏ', async () => {
    const response = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: testProductId,
        quantity: 2,
        size: 'M',
        color: 'Đen'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Test 16: Tạo đơn hàng
  test('POST /api/orders - Tạo đơn hàng', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [
          {
            productId: testProductId,
            quantity: 1,
            size: 'M',
            color: 'Đen'
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          phone: '0123456789',
          street: '123 Test Street',
          city: 'Ho Chi Minh'
        },
        paymentMethod: 'cod'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('orderNumber');
  });

  // Test 17: Xem đơn hàng của user
  test('GET /api/orders - Xem đơn hàng', async () => {
    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

// ================================================
// TEST SUITE 4: ADMIN FUNCTIONS
// ================================================
describe('Admin Tests', () => {

  // Test 18: Admin dashboard
  test('GET /api/admin/dashboard - Admin dashboard', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('overview');
  });

  // Test 19: User không thể access admin routes
  test('GET /api/admin/dashboard - User không có quyền', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  // Test 20: Admin lấy tất cả users
  test('GET /api/users - Admin lấy danh sách users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Test 21: Admin xem tất cả orders
  test('GET /api/admin/orders - Admin xem tất cả đơn hàng', async () => {
    const response = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });
});

// ================================================
// TEST SUITE 5: AUTHORIZATION
// ================================================
describe('Authorization Tests', () => {

  // Test 22: Truy cập không có token
  test('GET /api/users/profile - Không có token', async () => {
    const response = await request(app)
      .get('/api/users/profile');

    expect(response.status).toBe(401);
  });

  // Test 23: Token không hợp lệ
  test('GET /api/users/profile - Token không hợp lệ', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(401);
  });

  // Test 24: Token hợp lệ
  test('GET /api/users/profile - Token hợp lệ', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('email');
  });
});

// ================================================
// TEST SUITE 6: VALIDATION
// ================================================
describe('Validation Tests', () => {

  // Test 25: Đăng ký thiếu trường
  test('POST /api/auth/signup - Thiếu required fields', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com'
        // Thiếu fullName, password
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 26: Email không hợp lệ
  test('POST /api/auth/signup - Email không hợp lệ', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Test',
        email: 'invalid-email',
        password: 'Test@123'
      });

    expect(response.status).toBe(400);
  });

  // Test 27: Password yếu
  test('POST /api/auth/signup - Password yếu', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Test',
        email: 'test@example.com',
        password: '123' // Quá ngắn
      });

    expect(response.status).toBe(400);
  });

  // Test 28: Tạo product thiếu required fields
  test('POST /api/products - Thiếu required fields', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product'
        // Thiếu description, price, category, stock
      });

    expect(response.status).toBe(400);
  });
});

// ================================================
// SUMMARY
// ================================================

/**
 * TỔNG KẾT:
 * - 28 test cases
 * - Cover: Auth, Products, Cart, Orders, Admin, Authorization, Validation
 * - Pass rate mục tiêu: 100%
 * 
 * CHẠY TESTS:
 * npm test
 * 
 * HOẶC:
 * npm test -- --coverage (để xem test coverage)
 */