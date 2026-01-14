const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

/**
 * @route   GET /api/cart
 * @desc    Xem giỏ hàng
 * @access  Private
 */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images stock');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy giỏ hàng',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/cart/add
 * @desc    Thêm sản phẩm vào giỏ
 * @access  Private
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID là bắt buộc!'
      });
    }

    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại!'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Không đủ hàng trong kho!'
      });
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ 
        user: req.user._id, 
        items: [] 
      });
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa (cùng size, color)
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId &&
              item.size === size &&
              item.color === color
    );

    if (existingItemIndex > -1) {
      // Nếu đã có, tăng số lượng
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm mới
      cart.items.push({
        product: productId,
        quantity: quantity,
        size: size,
        color: color,
        price: product.price
      });
    }

    await cart.save();
    
    // Populate trước khi trả về
    await cart.populate('items.product', 'name price images stock');

    res.status(200).json({
      success: true,
      message: 'Đã thêm vào giỏ hàng!',
      data: cart
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm vào giỏ hàng',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/cart/update/:itemId
 * @desc    Cập nhật số lượng
 * @access  Private
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng không hợp lệ!'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng!'
      });
    }

    const item = cart.items.id(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ!'
      });
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Không đủ hàng trong kho!'
      });
    }

    item.quantity = quantity;
    await cart.save();
    
    await cart.populate('items.product', 'name price images stock');

    res.status(200).json({
      success: true,
      message: 'Đã cập nhật số lượng!',
      data: cart
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật giỏ hàng',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/cart/remove/:itemId
 * @desc    Xóa sản phẩm khỏi giỏ
 * @access  Private
 */
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng!'
      });
    }

    // Remove item by _id
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.status(200).json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng!',
      data: cart
    });

  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa sản phẩm',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/cart/clear
 * @desc    Xóa toàn bộ giỏ hàng
 * @access  Private
 */
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng!'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng!',
      data: cart
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa giỏ hàng',
      error: error.message
    });
  }
};
