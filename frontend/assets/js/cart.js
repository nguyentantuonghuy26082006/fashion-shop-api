// ================================================
// CART.JS - Quản lý giỏ hàng
// ================================================

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
function updateCartCount() {
    const token = getToken();
    const cartCountElement = document.getElementById('cartCount');
    
    if (!cartCountElement) return;
    
    if (token) {
        // Nếu đã đăng nhập, lấy từ API
        getCart()
            .then(data => {
                if (data.success) {
                    const count = data.data.items.length;
                    cartCountElement.textContent = count;
                }
            })
            .catch(() => {
                cartCountElement.textContent = '0';
            });
    } else {
        // Nếu chưa đăng nhập, dùng localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartCountElement.textContent = cart.length;
    }
}

/**
 * Thêm sản phẩm vào giỏ hàng
 */
async function addToCartFromDetail(productId, quantity = 1, size = '', color = '') {
    const token = getToken();
    
    if (!token) {
        showToast('Vui lòng đăng nhập để thêm vào giỏ hàng!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }

    if (quantity < 1) {
        showToast('Số lượng phải lớn hơn 0!', 'error');
        return false;
    }

    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId,
                quantity,
                size,
                color
            })
        });

        const data = await response.json();
        hideLoading();

        if (data.success) {
            showToast('Đã thêm vào giỏ hàng!');
            updateCartCount();
            return true;
        } else {
            showToast(data.message || 'Không thể thêm vào giỏ hàng!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error adding to cart:', error);
        showToast('Có lỗi xảy ra! Vui lòng thử lại.', 'error');
        return false;
    }
}

/**
 * Quick add to cart (from product list)
 */
async function quickAddToCart(productId) {
    return addToCartFromDetail(productId, 1, '', '');
}

/**
 * Update cart item quantity
 */
async function updateCartItemQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        return removeCartItem(itemId);
    }

    const token = getToken();
    if (!token) {
        showToast('Vui lòng đăng nhập!', 'error');
        return false;
    }

    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        const data = await response.json();
        hideLoading();

        if (data.success) {
            showToast('Đã cập nhật số lượng!');
            return true;
        } else {
            showToast(data.message || 'Không thể cập nhật!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error updating cart:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

/**
 * Remove item from cart
 */
async function removeCartItem(itemId) {
    const token = getToken();
    if (!token) {
        showToast('Vui lòng đăng nhập!', 'error');
        return false;
    }

    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        return false;
    }

    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        hideLoading();

        if (data.success) {
            showToast('Đã xóa khỏi giỏ hàng!');
            updateCartCount();
            return true;
        } else {
            showToast(data.message || 'Không thể xóa!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error removing from cart:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

/**
 * Clear entire cart
 */
async function clearCart() {
    const token = getToken();
    if (!token) {
        showToast('Vui lòng đăng nhập!', 'error');
        return false;
    }

    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
        return false;
    }

    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        hideLoading();

        if (data.success) {
            showToast('Đã xóa toàn bộ giỏ hàng!');
            updateCartCount();
            return true;
        } else {
            showToast(data.message || 'Không thể xóa giỏ hàng!', 'error');
            return false;
        }
    } catch (error) {
        hideLoading();
        console.error('Error clearing cart:', error);
        showToast('Có lỗi xảy ra!', 'error');
        return false;
    }
}

// Auto init
if (document.getElementById('cartCount')) {
    updateCartCount();
}

// Export functions
if (typeof window !== 'undefined') {
    window.addToCartFromDetail = addToCartFromDetail;
    window.quickAddToCart = quickAddToCart;
    window.updateCartItemQuantity = updateCartItemQuantity;
    window.removeCartItem = removeCartItem;
    window.clearCart = clearCart;
    window.updateCartCount = updateCartCount;
}
