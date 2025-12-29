const Order = require('../models/order.model');

/**
 * @route   POST /api/orders
 * @desc    Tạo đơn hàng mới
 * @access  Private
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, shippingFee = 30000 } = req.body;

    // Tính subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Sản phẩm ${item.productId} không tồn tại!`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" không đủ hàng!`
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: product.price,
        subtotal: itemSubtotal
      });

      // Giảm stock
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    const totalAmount = subtotal + shippingFee;

    // Tạo đơn hàng
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      totalAmount
    });

    // Xóa giỏ hàng sau khi đặt hàng
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo đơn hàng',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/orders
 * @desc    Lấy danh sách đơn hàng của user
 * @access  Private
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy đơn hàng',
      error: error.message
    });
  }
};