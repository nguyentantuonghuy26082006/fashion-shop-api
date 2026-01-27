const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Lấy thống kê tổng quan cho dashboard
 * @access  Private/Admin
 */
exports.getDashboard = async (req, res) => {
  try {
    // Thống kê tổng quan
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Doanh thu tổng (chỉ tính đơn đã giao + đã thanh toán)
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Đơn hàng pending
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // FIX: Thống kê đơn hàng theo từng trạng thái cho biểu đồ
    const orderStatusStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Chuyển đổi thành object dễ sử dụng
    const ordersByStatus = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0
    };
    orderStatusStats.forEach(item => {
      if (ordersByStatus.hasOwnProperty(item._id)) {
        ordersByStatus[item._id] = item.count;
      }
    });

    // Sản phẩm bán chạy
    const topProducts = await Product.find()
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name soldCount price images');

    // Đơn hàng gần đây
    const recentOrdersRaw = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'fullName email')
      .populate('items.product', 'name');

    // FIX: Xử lý trường hợp user bị null (user đã bị xóa)
    const recentOrders = recentOrdersRaw.map(order => {
      const orderObj = order.toObject();
      if (!orderObj.user) {
        orderObj.user = {
          _id: null,
          fullName: 'Người dùng đã xóa',
          email: 'N/A'
        };
      }
      return orderObj;
    });

    // ===== Doanh thu theo tháng (6 tháng gần nhất) - theo ngày giao thành công =====
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          deliveredAt: { $gte: sixMonthsAgo },
          status: 'delivered',
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$deliveredAt' },
            month: { $month: '$deliveredAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // ===== Doanh thu theo ngày (ngày giao thành công) - mặc định 30 ngày =====
    const days = Number(req.query.days || 30);

    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          deliveredAt: { $gte: start },
          status: 'delivered',
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$deliveredAt',
                timezone: 'Asia/Ho_Chi_Minh'
              }
            }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingOrders,
          ordersByStatus  // FIX: Thêm thống kê trạng thái đơn hàng
        },
        topProducts,
        recentOrders,
        monthlyRevenue,
        dailyRevenue
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy dữ liệu dashboard',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/statistics
 * @desc    Thống kê chi tiết
 * @access  Private/Admin
 */
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Thống kê đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Thống kê theo phương thức thanh toán
    const ordersByPayment = await Order.aggregate([
      { $match: query },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
    ]);

    // Top khách hàng
    const topCustomers = await Order.aggregate([
      { $match: { ...query, status: 'delivered' } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // Populate user info
    await User.populate(topCustomers, { path: '_id', select: 'fullName email' });

    res.status(200).json({
      success: true,
      data: {
        ordersByStatus,
        ordersByPayment,
        topCustomers
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/orders
 * @desc    Lấy tất cả đơn hàng (Admin)
 * @access  Private/Admin
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const ordersRaw = await Order.find(query)
      .populate('user', 'fullName email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // FIX: Xử lý trường hợp user bị null (user đã bị xóa)
    const orders = ordersRaw.map(order => {
      const orderObj = order.toObject();
      if (!orderObj.user) {
        orderObj.user = {
          _id: null,
          fullName: 'Người dùng đã xóa',
          email: 'N/A',
          phone: 'N/A'
        };
      }
      return orderObj;
    });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
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
      message: 'Lỗi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Cập nhật trạng thái đơn hàng
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng!'
      });
    }

    // Cập nhật trạng thái
    order.status = status;

    // Thêm vào lịch sử
    order.statusHistory.push({
      status,
      note,
      updatedBy: req.user._id,
      updatedAt: new Date()
    });

    // Nếu đã giao hàng
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid'; // Tự động cập nhật thanh toán
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công!',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái',
      error: error.message
    });
  }
};