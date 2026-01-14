// ================================================
// ADMIN.JS - Quản lý admin
// ================================================

/**
 * Check if user is admin
 */
function checkAdminAccess() {
    if (!requireAdmin()) {
        return false;
    }
    return true;
}

// ================================================
// DASHBOARD FUNCTIONS
// ================================================

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        const data = await getDashboard();
        
        if (data.success) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Không thể tải thống kê!', 'error');
        return null;
    }
}

/**
 * Display dashboard stats
 */
function displayDashboardStats(stats) {
    if (!stats) return;

    // Update stat cards
    if (document.getElementById('totalOrders')) {
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
    }
    if (document.getElementById('totalRevenue')) {
        document.getElementById('totalRevenue').textContent = formatPrice(stats.totalRevenue || 0);
    }
    if (document.getElementById('totalProducts')) {
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
    }
    if (document.getElementById('totalUsers')) {
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
    }
}

// ================================================
// PRODUCT MANAGEMENT
// ================================================

/**
 * Load all products for admin
 */
async function loadAdminProducts(params = {}) {
    try {
        showLoading();
        
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/products?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.success) {
            return data;
        }
        return { success: false, data: [] };
    } catch (error) {
        hideLoading();
        console.error('Error loading products:', error);
        showToast('Không thể tải sản phẩm!', 'error');
        return { success: false, data: [] };
    }
}

/**
 * Create new product
 */
async function createNewProduct(formData) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData // FormData for file upload
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.success) {
            showToast('Tạo sản phẩm thành công!');
            return true;
        } else {
            showToast(data.message || 'Không thể tạo sản phẩm!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error creating product:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

/**
 * Update product
 */
async function updateProduct(productId, formData) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.success) {
            showToast('Cập nhật sản phẩm thành công!');
            return true;
        } else {
            showToast(data.message || 'Không thể cập nhật!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error updating product:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        return false;
    }

    try {
        showLoading();
        
        const data = await apiCall(`/products/${productId}`, {
            method: 'DELETE'
        });
        
        hideLoading();
        
        if (data.success) {
            showToast('Đã xóa sản phẩm!');
            return true;
        } else {
            showToast(data.message || 'Không thể xóa!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error deleting product:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

// ================================================
// ORDER MANAGEMENT
// ================================================

/**
 * Load all orders
 */
async function loadAllOrders(params = {}) {
    try {
        const data = await getAllOrders(params);
        
        if (data.success) {
            return data;
        }
        return { success: false, data: [] };
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Không thể tải đơn hàng!', 'error');
        return { success: false, data: [] };
    }
}

/**
 * Update order status
 */
async function updateOrder(orderId, status, note = '') {
    try {
        showLoading();
        
        const data = await updateOrderStatus(orderId, status, note);
        hideLoading();
        
        if (data.success) {
            showToast('Đã cập nhật trạng thái đơn hàng!');
            return true;
        } else {
            showToast(data.message || 'Không thể cập nhật!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error updating order:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

/**
 * Display orders table
 */
function displayOrdersTable(orders, containerId = 'ordersTable') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-2"></i>
                    <p class="text-muted">Chưa có đơn hàng nào</p>
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.orderNumber || order._id.slice(-6)}</td>
            <td>${order.user?.fullName || 'N/A'}</td>
            <td>${formatPrice(order.totalAmount)}</td>
            <td>
                <span class="badge bg-${getStatusColor(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td>${order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <a href="order-detail.html?id=${order._id}" class="btn btn-info">
                        <i class="fas fa-eye"></i>
                    </a>
                    ${order.status === 'pending' ? `
                        <button onclick="confirmOrder('${order._id}')" class="btn btn-success">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="cancelOrder('${order._id}')" class="btn btn-danger">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Get status color
 */
function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'confirmed': 'info',
        'processing': 'primary',
        'shipping': 'primary',
        'delivered': 'success',
        'cancelled': 'danger',
        'returned': 'secondary'
    };
    return colors[status] || 'secondary';
}

/**
 * Get status text
 */
function getStatusText(status) {
    const texts = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'processing': 'Đang xử lý',
        'shipping': 'Đang giao',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy',
        'returned': 'Đã trả'
    };
    return texts[status] || status;
}

/**
 * Confirm order
 */
async function confirmOrder(orderId) {
    return updateOrder(orderId, 'confirmed', 'Đã xác nhận đơn hàng');
}

/**
 * Cancel order
 */
async function cancelOrder(orderId) {
    const reason = prompt('Lý do hủy đơn hàng:');
    if (!reason) return false;
    
    return updateOrder(orderId, 'cancelled', reason);
}

// ================================================
// USER MANAGEMENT
// ================================================

/**
 * Load all users
 */
async function loadAllUsers(params = {}) {
    try {
        const data = await getAllUsers(params);
        
        if (data.success) {
            return data;
        }
        return { success: false, data: [] };
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Không thể tải người dùng!', 'error');
        return { success: false, data: [] };
    }
}

/**
 * Update user role
 */
async function updateUserRoles(userId, roles) {
    try {
        showLoading();
        
        const data = await updateUserRole(userId, roles);
        hideLoading();
        
        if (data.success) {
            showToast('Đã cập nhật quyền người dùng!');
            return true;
        } else {
            showToast(data.message || 'Không thể cập nhật!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error updating user role:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

/**
 * Delete user
 */
async function deleteUserAccount(userId) {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) {
        return false;
    }

    try {
        showLoading();
        
        const data = await deleteUser(userId);
        hideLoading();
        
        if (data.success) {
            showToast('Đã xóa người dùng!');
            return true;
        } else {
            showToast(data.message || 'Không thể xóa!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error deleting user:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

/**
 * Display users table
 */
function displayUsersTable(users, containerId = 'usersTable') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!users || users.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-users fa-3x text-muted mb-2"></i>
                    <p class="text-muted">Chưa có người dùng nào</p>
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${user.avatar || 'https://via.placeholder.com/40'}" 
                         alt="${user.fullName}" 
                         class="rounded-circle me-2" 
                         style="width: 40px; height: 40px;">
                    <div>
                        <div class="fw-bold">${user.fullName}</div>
                        <small class="text-muted">${user.email}</small>
                    </div>
                </div>
            </td>
            <td>${user.phone || 'N/A'}</td>
            <td>
                <span class="badge bg-${user.roles.includes('admin') ? 'danger' : 'primary'}">
                    ${user.roles.includes('admin') ? 'Admin' : 'User'}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
            <td>
                <span class="badge bg-${user.isActive ? 'success' : 'secondary'}">
                    ${user.isActive ? 'Hoạt động' : 'Ngưng'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button onclick="editUser('${user._id}')" class="btn btn-info">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${!user.roles.includes('admin') ? `
                        <button onclick="deleteUserAccount('${user._id}')" class="btn btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Edit user (placeholder)
 */
function editUser(userId) {
    // Implement edit user modal or redirect to edit page
    showToast('Tính năng đang phát triển!', 'error');
}

// ================================================
// EXPORT FUNCTIONS
// ================================================

if (typeof window !== 'undefined') {
    window.checkAdminAccess = checkAdminAccess;
    window.loadDashboardStats = loadDashboardStats;
    window.displayDashboardStats = displayDashboardStats;
    window.loadAdminProducts = loadAdminProducts;
    window.createNewProduct = createNewProduct;
    window.updateProduct = updateProduct;
    window.deleteProduct = deleteProduct;
    window.loadAllOrders = loadAllOrders;
    window.updateOrder = updateOrder;
    window.displayOrdersTable = displayOrdersTable;
    window.confirmOrder = confirmOrder;
    window.cancelOrder = cancelOrder;
    window.loadAllUsers = loadAllUsers;
    window.updateUserRoles = updateUserRoles;
    window.deleteUserAccount = deleteUserAccount;
    window.displayUsersTable = displayUsersTable;
    window.editUser = editUser;
    window.getStatusColor = getStatusColor;
    window.getStatusText = getStatusText;
}