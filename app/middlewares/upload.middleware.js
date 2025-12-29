const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { upload: uploadConfig } = require('../config/app.config');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = uploadConfig.uploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// Filter file types
const fileFilter = (req, file, cb) => {
  // Kiểm tra MIME type
  if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Chỉ chấp nhận file ảnh: ${uploadConfig.allowedMimeTypes.join(', ')}`), false);
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: uploadConfig.maxFileSize // 5MB
  },
  fileFilter: fileFilter
});

/**
 * Middleware upload 1 ảnh
 */
exports.uploadSingle = upload.single('image');

/**
 * Middleware upload nhiều ảnh
 */
exports.uploadMultiple = upload.array('images', 5); // Tối đa 5 ảnh

/**
 * Middleware xử lý lỗi upload
 */
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Kích thước file vượt quá giới hạn ${uploadConfig.maxFileSize / (1024 * 1024)}MB`
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Số lượng file vượt quá giới hạn cho phép'
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Lỗi upload file'
    });
  }

  next();
};