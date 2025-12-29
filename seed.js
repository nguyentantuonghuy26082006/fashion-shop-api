require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./app/models/role.model');
const User = require('./app/models/user.model');
const Category = require('./app/models/category.model');

const connectDB = require('./app/config/database');

// Kết nối database
connectDB();

const seedData = async () => {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu...');

    // ===== 1. TẠO ROLES =====
    console.log('📋 Tạo roles...');
    
    const existingRoles = await Role.countDocuments();
    if (existingRoles === 0) {
      await Role.create([
        { name: 'user', description: 'Người dùng thông thường' },
        { name: 'moderator', description: 'Người kiểm duyệt sản phẩm' },
        { name: 'admin', description: 'Quản trị viên hệ thống' }
      ]);
      console.log('✅ Đã tạo 3 roles: user, moderator, admin');
    } else {
      console.log('⏭️  Roles đã tồn tại, bỏ qua...');
    }

    // ===== 2. TẠO ADMIN USER =====
    console.log('👤 Tạo admin user...');
    
    const existingAdmin = await User.findOne({ email: 'admin@fashionshop.com' });
    
    if (!existingAdmin) {
      const adminRole = await Role.findOne({ name: 'admin' });
      
      await User.create({
        fullName: 'Admin Fashion Shop',
        email: 'admin@fashionshop.com',
        password: 'Admin@123', // Sẽ tự động hash
        phone: '0123456789',
        roles: [adminRole._id],
        isActive: true,
        isEmailVerified: true
      });
      
      console.log('✅ Đã tạo admin user:');
      console.log('   Email: admin@fashionshop.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('⏭️  Admin user đã tồn tại, bỏ qua...');
    }

    // ===== 3. TẠO MODERATOR USER =====
    console.log('👤 Tạo moderator user...');
    
    const existingMod = await User.findOne({ email: 'moderator@fashionshop.com' });
    
    if (!existingMod) {
      const modRole = await Role.findOne({ name: 'moderator' });
      
      await User.create({
        fullName: 'Moderator Fashion Shop',
        email: 'moderator@fashionshop.com',
        password: 'Mod@123',
        phone: '0987654321',
        roles: [modRole._id],
        isActive: true
      });
      
      console.log('✅ Đã tạo moderator user:');
      console.log('   Email: moderator@fashionshop.com');
      console.log('   Password: Mod@123');
    } else {
      console.log('⏭️  Moderator user đã tồn tại, bỏ qua...');
    }

    // ===== 4. TẠO CATEGORIES MẪU =====
    console.log('📁 Tạo categories mẫu...');
    
    const existingCategories = await Category.countDocuments();
    
    if (existingCategories === 0) {
      const categories = await Category.create([
        { name: 'Áo Nam', description: 'Các loại áo dành cho nam giới', order: 1 },
        { name: 'Quần Nam', description: 'Các loại quần dành cho nam giới', order: 2 },
        { name: 'Áo Nữ', description: 'Các loại áo dành cho nữ giới', order: 3 },
        { name: 'Quần Nữ', description: 'Các loại quần dành cho nữ giới', order: 4 },
        { name: 'Phụ Kiện', description: 'Các loại phụ kiện thời trang', order: 5 }
      ]);
      
      // Tạo subcategories
      const aoNam = categories[0];
      await Category.create([
        { name: 'Áo Thun Nam', parent: aoNam._id, order: 1 },
        { name: 'Áo Sơ Mi Nam', parent: aoNam._id, order: 2 },
        { name: 'Áo Khoác Nam', parent: aoNam._id, order: 3 }
      ]);
      
      console.log('✅ Đã tạo categories mẫu');
    } else {
      console.log('⏭️  Categories đã tồn tại, bỏ qua...');
    }

    // ===== 5. TẠO USER THƯỜNG MẪU =====
    console.log('👥 Tạo user thường mẫu...');
    
    const existingUser = await User.findOne({ email: 'user@test.com' });
    
    if (!existingUser) {
      const userRole = await Role.findOne({ name: 'user' });
      
      await User.create({
        fullName: 'Nguyễn Văn A',
        email: 'user@test.com',
        password: 'User@123',
        phone: '0911111111',
        roles: [userRole._id],
        isActive: true
      });
      
      console.log('✅ Đã tạo user test:');
      console.log('   Email: user@test.com');
      console.log('   Password: User@123');
    } else {
      console.log('⏭️  User test đã tồn tại, bỏ qua...');
    }

    console.log('\n🎉 Seed dữ liệu hoàn tất!');
    console.log('\n📝 Thông tin đăng nhập:');
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
    console.log('==========================================\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi seed dữ liệu:', error);
    process.exit(1);
  }
};

// Chạy seed
seedData();

// ================================================
// HƯỚNG DẪN CHẠY SEED:
// 1. Đảm bảo MongoDB đang chạy
// 2. Đảm bảo file .env đã cấu hình đúng
// 3. Chạy: node seed.js