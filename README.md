# 🛍️ FASHION SHOP - Website Bán Quần Áo Thời Trang

## 📋 Giới thiệu

Fashion Shop là website thương mại điện tử bán quần áo thời trang, được xây dựng bằng **Node.js**, **Express.js**, **MongoDB** và **HTML/CSS/JavaScript**.

---

## 🔑 TÀI KHOẢN DEMO

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| 👑 **Admin** | admin@fashionshop.com | Admin@123 |
| 🛡️ **Moderator** | moderator@fashionshop.com | Mod@123 |
| 👤 **User** | user@test.com | User@123 |

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Backend:
- **Node.js** - Runtime JavaScript
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM cho MongoDB
- **JWT** - Xác thực đăng nhập
- **Bcrypt** - Mã hóa mật khẩu
- **Multer** - Upload file
- **Nodemailer** - Gửi email

### Frontend:
- **HTML5 / CSS3 / JavaScript**
- **Bootstrap 5** - UI Framework
- **Font Awesome** - Icons
- **Chart.js** - Biểu đồ

---

## 📁 CẤU TRÚC THƯ MỤC

```
fashion-shop/
├── server.js                 # Entry point - Khởi động server
├── .env                      # Biến môi trường
├── package.json              # Dependencies
├── uploads/                  # Ảnh upload
│   └── products/
│
├── app/
│   ├── config/               # Cấu hình
│   │   ├── database.js       # Kết nối MongoDB
│   │   ├── cloudinary.js     # Upload ảnh cloud
│   │   └── app.config.js     # Cấu hình chung
│   │
│   ├── models/               # Schema MongoDB
│   │   ├── user.model.js     # User schema
│   │   ├── product.model.js  # Product schema
│   │   ├── category.model.js # Category schema
│   │   ├── order.model.js    # Order schema
│   │   ├── cart.model.js     # Cart schema
│   │   └── role.model.js     # Role schema
│   │
│   ├── controllers/          # Xử lý logic
│   │   ├── auth.controller.js     # Đăng nhập, đăng ký
│   │   ├── user.controller.js     # Quản lý user
│   │   ├── product.controller.js  # Quản lý sản phẩm
│   │   ├── category.controller.js # Quản lý danh mục
│   │   ├── order.controller.js    # Quản lý đơn hàng
│   │   ├── cart.controller.js     # Giỏ hàng
│   │   └── admin.controller.js    # Dashboard admin
│   │
│   ├── routes/               # Định tuyến API
│   │   ├── auth.routes.js    # /api/auth/*
│   │   ├── user.routes.js    # /api/users/*
│   │   ├── product.routes.js # /api/products/*
│   │   ├── category.routes.js# /api/categories/*
│   │   ├── order.routes.js   # /api/orders/*
│   │   ├── cart.routes.js    # /api/cart/*
│   │   └── admin.routes.js   # /api/admin/*
│   │
│   ├── middlewares/          # Middleware
│   │   ├── auth.middleware.js    # Xác thực JWT
│   │   ├── role.middleware.js    # Phân quyền
│   │   ├── upload.middleware.js  # Upload file
│   │   └── error.middleware.js   # Xử lý lỗi
│   │
│   └── utils/                # Tiện ích
│       └── sendEmail.js      # Gửi email
│
└── frontend/                 # Frontend
    ├── index.html            # Trang chủ
    ├── assets/
    │   ├── css/
    │   └── js/
    │       ├── config.js     # Cấu hình API URL
    │       ├── auth.js       # Xử lý đăng nhập
    │       └── api.js        # Gọi API
    └── pages/
        ├── login.html        # Đăng nhập
        ├── register.html     # Đăng ký
        ├── products.html     # Danh sách sản phẩm
        ├── product-detail.html # Chi tiết sản phẩm
        ├── cart.html         # Giỏ hàng
        ├── checkout.html     # Thanh toán
        ├── profile.html      # Tài khoản
        └── admin/            # Trang quản trị
            ├── dashboard.html
            ├── products.html
            ├── categories.html
            ├── orders.html
            └── users.html
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY

### Yêu cầu:
- **Node.js** >= 16.x
- **MongoDB** (Local hoặc Atlas)
- **http-server** (cài global)

### Bước 1: Cài đặt http-server (nếu chưa có)
npm install -g http-server

### Bước 2: Cài đặt dependencies
npm install

### Bước 3: Chạy MongoDB
mongod

### Bước 4: Chạy Backend (Terminal 1)
node server.js
✅ Server chạy tại: **http://localhost:5000**

### Bước 5: Chạy Frontend (Terminal 2)
cd frontend
http-server -p3000

✅ Frontend chạy tại: **http://localhost:3000**

### Bước 6: Mở trình duyệt
```
http://localhost:3000
```


## 🔒 PHÂN QUYỀN

| Vai trò | Quyền hạn |
|---------|-----------|
| **User** | Xem sản phẩm, đặt hàng, quản lý profile |
| **Moderator** | User + Thêm/sửa/xóa sản phẩm, danh mục |
| **Admin** | Tất cả quyền + Quản lý users, thống kê |

---

## 🔐 BẢO MẬT

- **Bcrypt:** Mã hóa mật khẩu trước khi lưu database
- **JWT:** Tạo token xác thực để truy cập API
- **Helmet:** Bảo vệ các lỗ hổng HTTP headers
- **Rate Limiting:** Giới hạn request chống brute-force
- **CORS:** Kiểm soát truy cập cross-origin

---

## 📸 CHỨC NĂNG CHÍNH

### Người dùng:
- ✅ Đăng ký / Đăng nhập
- ✅ Quên mật khẩu (gửi email)
- ✅ Xem / Tìm kiếm sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng / Thanh toán
- ✅ Xem lịch sử đơn hàng
- ✅ Cập nhật thông tin cá nhân

### Admin:
- ✅ Dashboard thống kê
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý danh mục (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Quản lý người dùng
- ✅ Phân quyền người dùng

---
## 📝 GHI CHÚ

- Đảm bảo MongoDB đang chạy trước khi start server
- Backend chạy port **5000**, Frontend chạy port **3000**
- Cần mở **2 Terminal** để chạy cả Backend và Frontend

---

© 2024 Fashion Shop. All rights reserved.