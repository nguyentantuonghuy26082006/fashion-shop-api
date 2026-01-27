const Product = require('../models/product.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

function isCloudinaryConfigured() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret) return false;
  if (String(name).startsWith('your_') || String(key).startsWith('your_') || String(secret).startsWith('your_')) return false;
  return true;
}

function mapLocalFilesToImages(req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return (req.files || []).map(f => ({
    public_id: f.filename,
    url: `${baseUrl}/uploads/products/${f.filename}`
  }));
}

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
      inStock,
      isFeatured  // Thêm filter sản phẩm nổi bật
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Filter sản phẩm nổi bật
    if (isFeatured === 'true') {
      query.isFeatured = true;
    } else if (isFeatured === 'false') {
      query.isFeatured = false;
    }

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

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (tên, mô tả, giá, danh mục).' });
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      comparePrice: comparePrice !== undefined ? Number(comparePrice) : undefined,
      cost: cost !== undefined ? Number(cost) : undefined,
      category,
      brand,
      stock: stock !== undefined ? Number(stock) : 0,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      tags: tags ? JSON.parse(tags) : [],
      features: features ? JSON.parse(features) : [],
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    if (req.files && req.files.length > 0) {
      if (isCloudinaryConfigured()) {
        const imagePromises = req.files.map((file) => uploadToCloudinary(file.path, 'fashion-shop/products'));
        const uploadedImages = await Promise.all(imagePromises);
        product.images = uploadedImages;
      } else {
        product.images = mapLocalFilesToImages(req);
      }
    } else if (req.body.images) {
      let imagesData = req.body.images;
      
      if (typeof imagesData === 'string') {
        try {
          imagesData = JSON.parse(imagesData);
        } catch (e) {
          imagesData = [imagesData];
        }
      }
      
      if (!Array.isArray(imagesData)) {
        imagesData = [imagesData];
      }
      
      product.images = imagesData
        .filter(img => img)
        .map(img => {
          if (typeof img === 'object' && img.url) {
            return {
              public_id: img.public_id || `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url: img.url
            };
          }
          if (typeof img === 'string' && img.trim()) {
            return {
              public_id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url: img.trim()
            };
          }
          return null;
        })
        .filter(img => img !== null);
    }

    await product.save();
    await product.populate('category', 'name');

    return res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tạo sản phẩm', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

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

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (comparePrice !== undefined) product.comparePrice = Number(comparePrice);
    if (cost !== undefined) product.cost = Number(cost);
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (stock !== undefined) product.stock = Number(stock);

    if (sizes !== undefined) product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    if (colors !== undefined) product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    if (tags !== undefined) product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (features !== undefined) product.features = typeof features === 'string' ? JSON.parse(features) : features;

    if (isFeatured !== undefined) product.isFeatured = (isFeatured === 'true' || isFeatured === true);

    // Handle images - 3 cases:
    // 1. Upload files (req.files)
    // 2. URL images from req.body.images (string or array)
    // 3. Keep existing images (no changes)
    
    if (req.files && req.files.length > 0) {

      if (isCloudinaryConfigured()) {
        if (product.images && product.images.length > 0) {
          try {
            await Promise.all(product.images.map(img => img?.public_id ? deleteFromCloudinary(img.public_id) : Promise.resolve()));
          } catch (e) {
            console.warn('Warning: failed to delete old cloudinary images:', e.message);
          }
        }
        const uploadedImages = await Promise.all(
          req.files.map((file) => uploadToCloudinary(file.path, 'fashion-shop/products'))
        );
        product.images = uploadedImages;
      } else {
        product.images = mapLocalFilesToImages(req);
      }
    } else if (req.body.images !== undefined) {
  
      let imagesData = req.body.images;
      
    
      if (typeof imagesData === 'string') {
        try {
          imagesData = JSON.parse(imagesData);
        } catch (e) {
          imagesData = [imagesData];
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(imagesData)) {
        imagesData = [imagesData];
      }
      
      // Convert to proper format { public_id, url }
      product.images = imagesData
        .filter(img => img) // Remove null/undefined
        .map(img => {
          // If already in correct format { public_id, url }
          if (typeof img === 'object' && img.url) {
            return {
              public_id: img.public_id || `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url: img.url
            };
          }
          // If it's just a URL string
          if (typeof img === 'string' && img.trim()) {
            return {
              public_id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url: img.trim()
            };
          }
          return null;
        })
        .filter(img => img !== null);
    }
    // Case 3: No images provided - keep existing images

    await product.save();
    await product.populate('category', 'name');

    return res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật sản phẩm', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm!'
      });
    }

    // Xóa ảnh trên Cloudinary (nếu có và là ảnh Cloudinary)
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        // Chỉ xóa nếu là ảnh Cloudinary (có public_id hợp lệ)
        // Bỏ qua ảnh từ URL bên ngoài (Unsplash, etc.)
        if (img.public_id && img.url && img.url.includes('cloudinary')) {
          try {
            await deleteFromCloudinary(img.public_id);
          } catch (err) {
            console.log('Bỏ qua lỗi xóa ảnh Cloudinary:', img.public_id);
          }
        }
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công!'
    });

  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa sản phẩm',
      error: error.message
    });
  }
};