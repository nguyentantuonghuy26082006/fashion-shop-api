// ================================================
// PRODUCTS.JS - Quản lý sản phẩm
// ================================================

/**
 * Load và hiển thị danh sách sản phẩm
 */
async function loadProducts(params = {}) {
    try {
        showLoading();
        
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/products?${queryString}`);
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            return data;
        } else {
            throw new Error(data.message || 'Không thể tải sản phẩm');
        }
    } catch (error) {
        hideLoading();
        console.error('Error loading products:', error);
        showToast('Có lỗi khi tải sản phẩm!', 'error');
        return { success: false, data: [] };
    }
}

/**
 * Load chi tiết sản phẩm
 */
async function loadProductDetail(productId) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Không tìm thấy sản phẩm');
        }
    } catch (error) {
        hideLoading();
        console.error('Error loading product detail:', error);
        showToast('Không thể tải thông tin sản phẩm!', 'error');
        return null;
    }
}

/**
 * Hiển thị danh sách sản phẩm dạng grid
 */
function displayProductsGrid(products, containerId = 'productsContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-5x text-muted mb-3"></i>
                <h4>Không có sản phẩm nào</h4>
                <p class="text-muted">Hãy thử tìm kiếm với từ khóa khác</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
            <div class="product-card h-100">
                <div class="product-image position-relative">
                    <a href="product-detail.html?id=${product._id}">
                        <img src="${product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/300'}" 
                             alt="${product.name}" 
                             class="img-fluid">
                    </a>
                    ${product.discountPercent > 0 ? `
                        <span class="badge bg-danger position-absolute top-0 end-0 m-2">
                            -${product.discountPercent}%
                        </span>
                    ` : ''}
                    ${product.stock === 0 ? `
                        <span class="badge bg-secondary position-absolute top-0 start-0 m-2">
                            Hết hàng
                        </span>
                    ` : ''}
                </div>
                <div class="product-info p-3">
                    <a href="product-detail.html?id=${product._id}" class="text-decoration-none text-dark">
                        <h6 class="product-title mb-2">${product.name}</h6>
                    </a>
                    
                    ${product.category ? `
                        <small class="text-muted d-block mb-2">
                            <i class="fas fa-tag me-1"></i>${product.category.name}
                        </small>
                    ` : ''}
                    
                    <div class="product-price mb-2">
                        <span class="price text-primary fw-bold fs-5">
                            ${formatPrice(product.price)}
                        </span>
                        ${product.comparePrice > product.price ? `
                            <span class="old-price text-muted text-decoration-line-through ms-2">
                                ${formatPrice(product.comparePrice)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="d-flex gap-2">
                        <a href="product-detail.html?id=${product._id}" 
                           class="btn btn-primary btn-sm flex-grow-1">
                            <i class="fas fa-eye me-1"></i>
                            Xem chi tiết
                        </a>
                        ${product.stock > 0 ? `
                            <button onclick="quickAddToCart('${product._id}')" 
                                    class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        ` : `
                            <button class="btn btn-secondary btn-sm" disabled>
                                <i class="fas fa-ban"></i>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Hiển thị danh sách sản phẩm dạng list
 */
function displayProductsList(products, containerId = 'productsContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-box-open fa-5x text-muted mb-3"></i>
                <h4>Không có sản phẩm nào</h4>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-list-item card mb-3">
            <div class="row g-0">
                <div class="col-md-3">
                    <a href="product-detail.html?id=${product._id}">
                        <img src="${product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/300'}" 
                             alt="${product.name}" 
                             class="img-fluid rounded-start">
                    </a>
                </div>
                <div class="col-md-9">
                    <div class="card-body">
                        <h5 class="card-title">
                            <a href="product-detail.html?id=${product._id}" class="text-decoration-none text-dark">
                                ${product.name}
                            </a>
                        </h5>
                        <p class="card-text text-muted small">${product.description || 'Sản phẩm chất lượng cao'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="product-price">
                                <span class="price text-primary fw-bold fs-5">${formatPrice(product.price)}</span>
                                ${product.comparePrice > product.price ? `
                                    <span class="old-price text-muted text-decoration-line-through ms-2">
                                        ${formatPrice(product.comparePrice)}
                                    </span>
                                ` : ''}
                            </div>
                            <div class="btn-group">
                                <a href="product-detail.html?id=${product._id}" class="btn btn-primary btn-sm">
                                    Xem chi tiết
                                </a>
                                ${product.stock > 0 ? `
                                    <button onclick="quickAddToCart('${product._id}')" class="btn btn-outline-primary btn-sm">
                                        <i class="fas fa-cart-plus"></i>
                                    </button>
                                ` : `
                                    <button class="btn btn-secondary btn-sm" disabled>Hết hàng</button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Load và hiển thị categories
 */
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        }
        return [];
    } catch (error) {
        console.error('Error loading categories:', error);
        return [];
    }
}

/**
 * Display categories
 */
function displayCategories(categories, containerId = 'categoriesContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = categories.map(cat => `
        <a href="products.html?category=${cat._id}" 
           class="btn btn-outline-primary btn-sm me-2 mb-2">
            ${cat.name}
        </a>
    `).join('');
}

/**
 * Search products
 */
async function searchProducts(keyword) {
    return loadProducts({ search: keyword });
}

/**
 * Filter products by category
 */
async function filterByCategory(categoryId) {
    return loadProducts({ category: categoryId });
}

/**
 * Sort products
 */
async function sortProducts(sortBy) {
    return loadProducts({ sort: sortBy });
}

/**
 * Pagination
 */
function renderProductsPagination(totalPages, currentPage, containerId = 'pagination') {
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    let html = '<nav><ul class="pagination justify-content-center">';
    
    // Previous
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Pages
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
    
    // Next
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

/**
 * Get related products
 */
async function getRelatedProducts(productId, categoryId) {
    try {
        const params = {
            category: categoryId,
            limit: 4,
            exclude: productId
        };
        
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/products?${queryString}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        }
        return [];
    } catch (error) {
        console.error('Error loading related products:', error);
        return [];
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.loadProducts = loadProducts;
    window.loadProductDetail = loadProductDetail;
    window.displayProductsGrid = displayProductsGrid;
    window.displayProductsList = displayProductsList;
    window.loadCategories = loadCategories;
    window.displayCategories = displayCategories;
    window.searchProducts = searchProducts;
    window.filterByCategory = filterByCategory;
    window.sortProducts = sortProducts;
    window.renderProductsPagination = renderProductsPagination;
    window.getRelatedProducts = getRelatedProducts;
}
