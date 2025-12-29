const Product = require('../models/product.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * @route   GET /api/products
 * @desc    Lấy danh sách sản phẩm (có filter, search, pagination)
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      brand,
      inStock
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortBy.startsWith('-') ? { [sortBy.slice(1)]: -1 } : { [sortBy]: 1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách sản phẩm',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Lấy chi tiết sản phẩm
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm!'
      });
    }

    // Tăng view count
    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin sản phẩm',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/products
 * @desc    Thêm sản phẩm mới (Admin/Moderator only)
 * @access  Private/Admin/Moderator
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      cost,
      category,
      brand,
      stock,
      sizes,
      colors,
      tags,
      features,
      isFeatured
    } = req.body;

    // Tạo sản phẩm
    const product = await Product.create({
      name,
      description,
      price,
      comparePrice,
      cost,
      category,
      brand,
      stock,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      tags: tags ? JSON.parse(tags) : [],
      features: features ? JSON.parse(features) : [],
      isFeatured,
      images: []
    });

    // Upload ảnh nếu có
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file =>
        uploadToCloudinary(file.path, 'fashion-shop/products')
      );

      const uploadedImages = await Promise.all(imagePromises);
      product.images = uploadedImages;
      await product.save();
    }

    await product.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công!',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm sản phẩm',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Cập nhật sản phẩm (Admin/Moderator only)
 * @access  Private/Admin/Moderator
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm!'
      });
    }

    // Cập nhật các field
    const allowedFields = [
      'name', 'description', 'price', 'comparePrice', 'cost',
      'category', 'brand', 'stock', 'isActive', 'isFeatured'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Xử lý arrays
    if (req.body.sizes) product.sizes = JSON.parse(req.body.sizes);
    if (req.body.colors) product.colors = JSON.parse(req.body.colors);
    if (req.body.tags) product.tags = JSON.parse(req.body.tags);
    if (req.body.features) product.features = JSON.parse(req.body.features);

    // Upload ảnh mới nếu có
    if (req.files && req.files.length > 0) {
      // Xóa ảnh cũ trên Cloudinary
      const deletePromises = product.images.map(img =>
        deleteFromCloudinary(img.public_id)
      );
      await Promise.all(deletePromises);

      // Upload ảnh mới
      const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.path, 'fashion-shop/products')
      );
      product.images = await Promise.all(uploadPromises);
    }

    await product.save();
    await product.populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công!',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật sản phẩm',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Xóa sản phẩm (Admin/Moderator only)
 * @access  Private/Admin/Moderator
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm!'
      });
    }

    // Xóa ảnh trên Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(img =>
        deleteFromCloudinary(img.public_id)
      );
      await Promise.all(deletePromises);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa sản phẩm',
      error: error.message
    });
  }
};