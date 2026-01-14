function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.email) {
        // User is logged in
        document.getElementById('authNav')?.classList.add('d-none');
        document.getElementById('userNav')?.classList.remove('d-none');
        document.getElementById('userName').textContent = user.fullName || 'User';
        
        // Show admin link if user is admin
        if (user.roles && user.roles.includes('admin')) {
            document.getElementById('adminLink')?.classList.remove('d-none');
        }
    } else {
        // User is not logged in
        document.getElementById('authNav')?.classList.remove('d-none');
        document.getElementById('userNav')?.classList.add('d-none');
    }
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        showToast('Đã đăng xuất thành công!');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }
}

// Get token
function getToken() {
    return localStorage.getItem('token');
}

// Get user
function getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
}

// Check if user is admin
function isAdmin() {
    const user = getUser();
    return user.roles && (user.roles.includes('admin') || user.roles.includes('moderator'));
}

// Require auth - redirect to login if not authenticated
function requireAuth() {
    const token = getToken();
    if (!token) {
        showToast('Vui lòng đăng nhập để tiếp tục!', 'error');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1000);
        return false;
    }
    return true;
}

// Require admin - redirect if not admin
function requireAdmin() {
    if (!requireAuth()) return false;
    
    if (!isAdmin()) {
        showToast('Bạn không có quyền truy cập!', 'error');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
        return false;
    }
    return true;
}
