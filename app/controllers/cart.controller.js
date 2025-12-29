const Cart = require('../models/cart.model');

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
    const { productId, quantity, size, color } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại!'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Không đủ hàng trong kho!'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find(
      item => item.product.toString() === productId &&
              item.size === size &&
              item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images');

    res.status(200).json({
      success: true,
      message: 'Đã thêm vào giỏ hàng!',
      data: cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm vào giỏ hàng',
      error: error.message
    });
  }
};