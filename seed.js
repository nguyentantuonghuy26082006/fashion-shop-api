require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./app/models/role.model');
const User = require('./app/models/user.model');
const Category = require('./app/models/category.model');
const Product = require('./app/models/product.model');
const Order = require('./app/models/order.model');
const Cart = require('./app/models/cart.model');

const connectDB = require('./app/config/database');

// Kết nối database
connectDB();

const resetDatabase = async () => {
  try {
    console.log('\n🔥🔥🔥 BẮT ĐẦU RESET DATABASE HOÀN TOÀN 🔥🔥🔥\n');

    // ===== XÓA TẤT CẢ DỮ LIỆU CŨ =====
    console.log('🗑️  Xóa tất cả dữ liệu cũ...');
    
    await User.deleteMany({});
    console.log('✅ Đã xóa tất cả Users');
    
    await Role.deleteMany({});
    console.log('✅ Đã xóa tất cả Roles');
    
    await Category.deleteMany({});
    console.log('✅ Đã xóa tất cả Categories');
    
    await Product.deleteMany({});
    console.log('✅ Đã xóa tất cả Products');
    
    await Order.deleteMany({});
    console.log('✅ Đã xóa tất cả Orders');
    
    await Cart.deleteMany({});
    console.log('✅ Đã xóa tất cả Carts');

    console.log('\n✅ ĐÃ XÓA SẠCH DATABASE!\n');

    // ===== TẠO ROLES MỚI =====
    console.log('📋 Tạo roles mới...');
    
    const userRole = await Role.create({
      name: 'user',
      description: 'Người dùng thông thường'
    });
    console.log('✅ Tạo role: user -', userRole._id);

    const moderatorRole = await Role.create({
      name: 'moderator',
      description: 'Người kiểm duyệt sản phẩm'
    });
    console.log('✅ Tạo role: moderator -', moderatorRole._id);

    const adminRole = await Role.create({
      name: 'admin',
      description: 'Quản trị viên hệ thống'
    });
    console.log('✅ Tạo role: admin -', adminRole._id);

    // ===== TẠO ADMIN USER =====
    console.log('\n👤 Tạo admin user...');
    
    const adminUser = await User.create({
      fullName: 'Admin Fashion Shop',
      email: 'admin@fashionshop.com',
      password: 'Admin@123',
      phone: '0123456789',
      roles: [adminRole._id],  // ObjectId!
      isActive: true,
      isEmailVerified: true
    });
    
    console.log('✅ Đã tạo admin:');
    console.log('   Email: admin@fashionshop.com');
    console.log('   Password: Admin@123');
    console.log('   Role ID:', adminRole._id);
    console.log('   User ID:', adminUser._id);

    // ===== TẠO MODERATOR USER =====
    console.log('\n👤 Tạo moderator user...');
    
    const moderatorUser = await User.create({
      fullName: 'Moderator Fashion Shop',
      email: 'moderator@fashionshop.com',
      password: 'Mod@123',
      phone: '0987654321',
      roles: [moderatorRole._id],  // ObjectId!
      isActive: true
    });
    
    console.log('✅ Đã tạo moderator:');
    console.log('   Email: moderator@fashionshop.com');
    console.log('   Password: Mod@123');
    console.log('   Role ID:', moderatorRole._id);
    console.log('   User ID:', moderatorUser._id);

    // ===== TẠO USER THƯỜNG =====
    console.log('\n👤 Tạo user thường...');
    
    const normalUser = await User.create({
      fullName: 'Nguyễn Văn A',
      email: 'user@test.com',
      password: 'User@123',
      phone: '0911111111',
      roles: [userRole._id],  // ObjectId!
      isActive: true
    });
    
    console.log('✅ Đã tạo user:');
    console.log('   Email: user@test.com');
    console.log('   Password: User@123');
    console.log('   Role ID:', userRole._id);
    console.log('   User ID:', normalUser._id);

    // ===== TẠO CATEGORIES =====
    console.log('\n📁 Tạo categories...');
    
    const categories = await Category.create([
      { name: 'Giày Nam', description: 'Giày dành cho nam giới', order: 1 },
      { name: 'Giày Nữ', description: 'Giày dành cho nữ giới', order: 2 },
      { name: 'Giày Thể Thao', description: 'Giày thể thao nam nữ', order: 3 },
      { name: 'Phụ Kiện', description: 'Phụ kiện thời trang', order: 4 }
    ]);
    
    console.log(`✅ Đã tạo ${categories.length} categories`);

    // ===== VERIFY DỮ LIỆU =====
    console.log('\n🔍 Kiểm tra dữ liệu đã tạo...\n');
    
    // Verify Admin
    const verifyAdmin = await User.findOne({ email: 'admin@fashionshop.com' }).populate('roles');
    console.log('👤 Admin User:');
    console.log('   ID:', verifyAdmin._id);
    console.log('   Email:', verifyAdmin.email);
    console.log('   Roles (ObjectId):', verifyAdmin.roles.map(r => r._id));
    console.log('   Roles (names):', verifyAdmin.roles.map(r => r.name));
    console.log('   Password hash:', verifyAdmin.password ? 'CÓ' : 'KHÔNG');

    // Verify User
    const verifyUser = await User.findOne({ email: 'user@test.com' }).populate('roles');
    console.log('\n👤 Normal User:');
    console.log('   ID:', verifyUser._id);
    console.log('   Email:', verifyUser.email);
    console.log('   Roles (ObjectId):', verifyUser.roles.map(r => r._id));
    console.log('   Roles (names):', verifyUser.roles.map(r => r.name));
    console.log('   Password hash:', verifyUser.password ? 'CÓ' : 'KHÔNG');

    console.log('\n========================================');
    console.log('🎉 RESET DATABASE HOÀN TẤT!');
    console.log('========================================');
    console.log('\n📝 THÔNG TIN ĐĂNG NHẬP:');
    console.log('==========================================');
    console.log('ADMIN:');
    console.log('  Email: admin@fashionshop.com');
    console.log('  Password: Admin@123');
    console.log('\nMODERATOR:');
    console.log('  Email: moderator@fashionshop.com');
    console.log('  Password: Mod@123');
    console.log('\nUSER:');
    console.log('  Email: user@test.com');
    console.log('  Password: User@123');
    console.log('==========================================');
    console.log('\n⚠️  QUAN TRỌNG:');
    console.log('1. Backend đã restart chưa? → node server.js');
    console.log('2. Frontend đã clear localStorage chưa?');
    console.log('   → Mở Console (F12)');
    console.log('   → Gõ: localStorage.clear()');
    console.log('   → Refresh trang (F5)');
    console.log('3. Đăng nhập lại với tài khoản mới!');
    console.log('==========================================\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ LỖI RESET DATABASE:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
};

// Chạy reset
resetDatabase();