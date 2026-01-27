const Category = require('../models/category.model');
const Product = require('../models/product.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * @route   GET /api/categories
 * @desc    Lấy danh sách danh mục đang hoạt động
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
 * @route   GET /api/categories/admin/all
 * @desc    Lấy toàn bộ danh mục + số sản phẩm (Admin/Moderator)
 * @access  Private/Admin/Moderator
 */
exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      { $project: { products: 0 } },
      { $sort: { order: 1, name: 1 } }
    ]);

    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        summary: { totalCategories, activeCategories, totalProducts },
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách danh mục (admin)',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/categories/:id
 * @desc    Lấy chi tiết danh mục
 * @access  Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name slug');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: 'ID danh mục không hợp lệ', error: error.message });
  }
};

/**
 * @route   POST /api/categories
 * @desc    Thêm danh mục mới (Admin/Moderator only)
 * @access  Private/Admin/Moderator
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent, order, isActive } = req.body;

    const category = await Category.create({
      name,
      description,
      parent: parent || null,
      order: Number(order) || 0,
      isActive: typeof isActive === 'boolean' ? isActive : true
    });

    // Upload ảnh nếu có
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'fashion-shop/categories');
      category.image = { public_id: result.public_id, url: result.url };
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

/**
 * @route   PUT /api/categories/:id
 * @desc    Cập nhật danh mục (Admin/Moderator)
 * @access  Private/Admin/Moderator
 */
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, parent, order, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent || null;
    if (order !== undefined) category.order = Number(order) || 0;
    if (isActive !== undefined) category.isActive = (isActive === true || isActive === 'true');

    // Nếu có ảnh mới -> upload, đồng thời xóa ảnh cũ (nếu có)
    if (req.file) {
      if (category.image && category.image.public_id) {
        await deleteFromCloudinary(category.image.public_id);
      }
      const result = await uploadToCloudinary(req.file.path, 'fashion-shop/categories');
      category.image = { public_id: result.public_id, url: result.url };
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công!',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật danh mục',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Xóa danh mục (soft delete) - chặn nếu đang có sản phẩm
 * @access  Private/Admin/Moderator
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.'
      });
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Đã xóa danh mục (ẩn khỏi hệ thống).'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa danh mục', error: error.message });
  }
};
