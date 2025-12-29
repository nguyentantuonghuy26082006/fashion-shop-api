const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary với credentials từ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload ảnh lên Cloudinary
 * @param {string} filePath - Đường dẫn file ảnh
 * @param {string} folder - Thư mục lưu trên Cloudinary
 * @returns {Promise<object>} - Thông tin ảnh đã upload
 */
const uploadToCloudinary = async (filePath, folder = 'fashion-shop') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Giới hạn kích thước
        { quality: 'auto' }, // Tự động optimize chất lượng
        { fetch_format: 'auto' } // Tự động chọn format tối ưu
      ]
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Lỗi upload Cloudinary:', error);
    throw new Error('Upload ảnh thất bại');
  }
};

/**
 * Xóa ảnh từ Cloudinary
 * @param {string} publicId - Public ID của ảnh
 * @returns {Promise<void>}
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Đã xóa ảnh: ${publicId}`);
  } catch (error) {
    console.error('Lỗi xóa ảnh Cloudinary:', error);
    throw new Error('Xóa ảnh thất bại');
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};