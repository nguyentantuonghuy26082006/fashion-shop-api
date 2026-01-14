async function apiCall(endpoint, options = {}) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        // Handle token expiration
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'error');
            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 1500);
            throw new Error('Token expired');
        }
        
        return data;
        
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth APIs
async function login(email, password) {
    return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

async function register(userData) {
    return apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

// Product APIs
async function getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products?${queryString}`);
}

async function getProductById(id) {
    return apiCall(`/products/${id}`);
}

async function createProduct(formData) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData // FormData for file upload
    });
    return response.json();
}

async function updateProduct(id, formData) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    return response.json();
}

async function deleteProduct(id) {
    return apiCall(`/products/${id}`, {
        method: 'DELETE'
    });
}

// Category APIs
async function getCategories() {
    return apiCall('/categories');
}

// Cart APIs
async function getCart() {
    return apiCall('/cart');
}

async function addToCartAPI(productId, quantity, size, color) {
    return apiCall('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, size, color })
    });
}

// Order APIs
async function createOrder(orderData) {
    return apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

async function getMyOrders() {
    return apiCall('/orders');
}

async function getOrderById(id) {
    return apiCall(`/orders/${id}`);
}

// Admin APIs
async function getDashboard() {
    return apiCall('/admin/dashboard');
}

async function getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/orders?${queryString}`);
}

async function updateOrderStatus(orderId, status, note) {
    return apiCall(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note })
    });
}

async function getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/users?${queryString}`);
}

async function updateUserRole(userId, roles) {
    return apiCall(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ roles })
    });
}

async function deleteUser(userId) {
    return apiCall(`/users/${userId}`, {
        method: 'DELETE'
    });
}

// Profile APIs
async function getProfile() {
    return apiCall('/users/profile');
}

async function updateProfile(formData) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    return response.json();
}

async function changePassword(currentPassword, newPassword) {
    return apiCall('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
    });
}

// ================================================
// CART MANAGEMENT (LocalStorage backup)
// ================================================

function updateCartCount() {
    const token = getToken();
    
    if (token) {
        // If logged in, get from API
        getCart().then(data => {
            if (data.success) {
                const count = data.data.items.length;
                document.getElementById('cartCount').textContent = count;
            }
        }).catch(() => {
            document.getElementById('cartCount').textContent = '0';
        });
    } else {
        // If not logged in, use localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        document.getElementById('cartCount').textContent = cart.length;
    }
}

// Initialize cart count on page load
if (document.getElementById('cartCount')) {
    updateCartCount();
}

// ================================================
// PAGINATION HELPER
// ================================================

function renderPagination(totalPages, currentPage, containerId) {
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) return;
    
    let html = '<nav><ul class="pagination justify-content-center">';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    html += '</ul></nav>';
    container.innerHTML = html;
}

// ================================================
// IMAGE PREVIEW HELPER
// ================================================

function previewImage(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ================================================
// FORM VALIDATION HELPER
// ================================================

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}