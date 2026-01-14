const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');


exports.createOrder = async (req, res) => {
    console.log('\n========================================');
    console.log('📝 BẮT ĐẦU TẠO ĐƠN HÀNG');
    console.log('========================================');
    
    try {
        const userId = req.user.id;
        console.log('👤 User ID:', userId);
        console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));

        const { items, shippingAddress, paymentMethod } = req.body;

        
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('❌ ERROR: Giỏ hàng trống hoặc không hợp lệ');
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống!'
            });
        }

        console.log(`✅ Items hợp lệ: ${items.length} sản phẩm`);

        // ================================================
        // VALIDATION 2: CHECK SHIPPING ADDRESS
        // ================================================
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city) {
            console.error('❌ ERROR: Thiếu thông tin địa chỉ giao hàng');
            console.error('Shipping Address received:', shippingAddress);
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin giao hàng!'
            });
        }

        console.log('✅ Địa chỉ giao hàng hợp lệ');

        // ================================================
        // VALIDATION 3: CHECK PAYMENT METHOD
        // ================================================
        const validPaymentMethods = ['cod', 'bank_transfer', 'credit_card', 'e_wallet'];
        if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
            console.error('❌ ERROR: Phương thức thanh toán không hợp lệ:', paymentMethod);
            return res.status(400).json({
                success: false,
                message: 'Phương thức thanh toán không hợp lệ!'
            });
        }

        console.log(`✅ Phương thức thanh toán: ${paymentMethod}`);

        // ================================================
        // STEP 1: VALIDATE & GET PRODUCTS
        // ================================================
        console.log('\n🔍 BƯỚC 1: VALIDATE SẢN PHẨM');
        console.log('----------------------------------------');
        
        const orderItems = [];
        let subtotal = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log(`\n📦 Sản phẩm ${i + 1}/${items.length}:`);
            console.log(`  - Product ID: ${item.productId}`);
            console.log(`  - Quantity: ${item.quantity}`);

            // Validate item
            if (!item.productId) {
                console.error(`  ❌ Thiếu productId cho item ${i + 1}`);
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm thứ ${i + 1} không hợp lệ (thiếu ID)!`
                });
            }

            if (!item.quantity || item.quantity < 1) {
                console.error(`  ❌ Số lượng không hợp lệ cho item ${i + 1}`);
                return res.status(400).json({
                    success: false,
                    message: `Số lượng sản phẩm thứ ${i + 1} không hợp lệ!`
                });
            }

            // Get product from database
            const product = await Product.findById(item.productId);
            
            if (!product) {
                console.error(`  ❌ Không tìm thấy sản phẩm ID: ${item.productId}`);
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy sản phẩm (ID: ${item.productId})!`
                });
            }

            console.log(`  ✅ Tìm thấy: ${product.name}`);
            console.log(`  - Giá: ${product.price}`);
            console.log(`  - Tồn kho: ${product.stock}`);

            // Check stock
            if (product.stock < item.quantity) {
                console.error(`  ❌ Không đủ hàng: Yêu cầu ${item.quantity}, còn ${product.stock}`);
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm!`
                });
            }

            const itemSubtotal = product.price * item.quantity;
            console.log(`  💰 Thành tiền: ${itemSubtotal}`);

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                size: item.size || '',
                color: item.color || '',
                subtotal: itemSubtotal,
                image: product.images && product.images[0] ? product.images[0].url : ''
            });

            subtotal += itemSubtotal;
        }

        console.log('\n✅ TẤT CẢ SẢN PHẨM HỢP LỆ');
        console.log(`💰 Tạm tính (subtotal): ${subtotal}`);

        // ================================================
        // STEP 2: CALCULATE SHIPPING & TOTAL
        // ================================================
        const SHIPPING_FEE = subtotal > 500000 ? 0 : 30000;
        const totalAmount = subtotal + SHIPPING_FEE;
        
        console.log(`🚚 Phí vận chuyển: ${SHIPPING_FEE}`);
        console.log(`💰 Tổng tiền: ${totalAmount}`);

        // ================================================
        // STEP 3: CREATE ORDER
        // ================================================
        console.log('\n📝 BƯỚC 3: TẠO ĐƠN HÀNG');
        console.log('----------------------------------------');

        const order = new Order({
            user: userId,
            items: orderItems,
            subtotal: subtotal,
            shippingFee: SHIPPING_FEE,
            totalAmount: totalAmount,
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                street: shippingAddress.street,
                city: shippingAddress.city,
                district: shippingAddress.district || '',
                ward: shippingAddress.ward || '',
                note: shippingAddress.note || ''
            },
            paymentMethod: paymentMethod,
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                note: 'Đơn hàng mới được tạo',
                updatedAt: new Date()
            }]
        });

        const savedOrder = await order.save();
        console.log(`✅ Đơn hàng đã lưu: ${savedOrder._id}`);
        console.log(`📋 Mã đơn hàng: ${savedOrder.orderNumber}`);

        // ================================================
        // STEP 4: UPDATE PRODUCT STOCK
        // ================================================
        console.log('\n📦 BƯỚC 4: CẬP NHẬT TỒN KHO');
        console.log('----------------------------------------');

        for (const item of orderItems) {
            try {
                const updateResult = await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
                
                if (updateResult) {
                    console.log(`✅ ${item.name}: Giảm ${item.quantity}, còn ${updateResult.stock}`);
                } else {
                    console.warn(`⚠️ Không tìm thấy sản phẩm để update stock: ${item.product}`);
                }
            } catch (error) {
                console.error(`❌ Lỗi update stock cho ${item.name}:`, error.message);
            }
        }

        // ================================================
        // STEP 5: CLEAR CART (NON-BLOCKING)
        // ================================================
        console.log('\n🗑️ BƯỚC 5: XÓA GIỎ HÀNG');
        console.log('----------------------------------------');

        try {
            const cartDeleteResult = await Cart.findOneAndDelete({ user: userId });
            if (cartDeleteResult) {
                console.log('✅ Đã xóa giỏ hàng');
            } else {
                console.log('⚠️ Không tìm thấy giỏ hàng để xóa');
            }
        } catch (cartError) {
            console.error('⚠️ Lỗi khi xóa giỏ hàng:', cartError.message);
        }

        // ================================================
        // SUCCESS RESPONSE
        // ================================================
        console.log('\n========================================');
        console.log('✅ TẠO ĐƠN HÀNG THÀNH CÔNG');
        console.log(`📋 Order Number: ${savedOrder.orderNumber}`);
        console.log(`📋 Order ID: ${savedOrder._id}`);
        console.log(`💰 Tạm tính: ${savedOrder.subtotal}`);
        console.log(`🚚 Phí ship: ${savedOrder.shippingFee}`);
        console.log(`💰 Tổng tiền: ${savedOrder.totalAmount}`);
        console.log(`📦 Số sản phẩm: ${savedOrder.items.length}`);
        console.log('========================================\n');

        return res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            data: savedOrder
        });

    } catch (error) {
        console.error('\n========================================');
        console.error('❌ LỖI TẠO ĐƠN HÀNG');
        console.error('========================================');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('========================================\n');

        return res.status(500).json({
            success: false,
            message: 'Lỗi tạo đơn hàng: ' + error.message
        });
    }
};

// ================================================
// GET USER ORDERS
// ================================================
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error getting user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách đơn hàng!'
        });
    }
};

// ================================================
// GET ORDER BY ID (USER - chỉ xem đơn của mình)
// ================================================
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ _id: id, user: userId })
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng!'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin đơn hàng!'
        });
    }
};

// ================================================
// CANCEL ORDER
// ================================================
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ _id: id, user: userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng!'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận!'
            });
        }

        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            note: 'Đơn hàng đã bị hủy bởi khách hàng',
            updatedAt: new Date()
        });
        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Đã hủy đơn hàng!',
            data: order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi hủy đơn hàng!'
        });
    }
};

// ================================================
// ADMIN: GET ALL ORDERS
// ================================================
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'fullName email')
            .populate('items.product')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error getting all orders:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách đơn hàng!'
        });
    }
};

// ================================================
// ADMIN: GET ORDER BY ID (Xem chi tiết bất kỳ đơn nào)
// ================================================
exports.getOrderByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('📋 Admin xem chi tiết đơn hàng:', id);

        const order = await Order.findById(id)
            .populate('user', 'fullName email phone')
            .populate('items.product', 'name brand images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng!'
            });
        }

        console.log('✅ Tìm thấy đơn hàng:', order.orderNumber);

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error getting order by ID (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin đơn hàng!'
        });
    }
};

// ================================================
// ADMIN: UPDATE ORDER STATUS
// ================================================
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ!'
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng!'
            });
        }

        order.status = status;
        order.statusHistory.push({
            status: status,
            note: note || `Cập nhật trạng thái thành ${status}`,
            updatedBy: req.user.id,
            updatedAt: new Date()
        });
        
        if (status === 'delivered') {
            order.deliveredAt = new Date();
            order.paymentStatus = 'paid';
        }
        
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Đã cập nhật trạng thái đơn hàng!',
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật trạng thái đơn hàng!'
        });
    }
};