const Category = require('../models/category.model');

/**
 * @route   GET /api/categories
 * @desc    Lấy danh sách danh mục
 * @access  Public
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách danh mục',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/categories
 * @desc    Thêm danh mục mới (Admin/Moderator only)
 * @access  Private/Admin/Moderator
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent, order } = req.body;

    const category = await Category.create({
      name,
      description,
      parent: parent || null,
      order: order || 0
    });

    // Upload ảnh nếu có
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'fashion-shop/categories');
      category.image = {
        public_id: result.public_id,
        url: result.url
      };
      await category.save();
    }

    res.status(201).json({
      success: true,
      message: 'Thêm danh mục thành công!',
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm danh mục',
      error: error.message
    });
  }
};