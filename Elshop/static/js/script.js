/* =====================================================
    GAMING JAVASCRIPT - Enhanced Interactions
    ===================================================== */

// Cart storage key
const CART_STORAGE_KEY = 'game_shop_cart';

// Get cart from localStorage
function getCartFromStorage() {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : {};
    } catch (e) {
        return {};
    }
}

// Save cart to localStorage
function saveCartToStorage(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart to localStorage:', e);
    }
}

// Get quantity of a product in cart
function getCartQuantity(productId) {
    const cart = getCartFromStorage();
    return cart[productId] || 0;
}

// Set quantity of a product in cart
function setCartQuantity(productId, quantity) {
    const cart = getCartFromStorage();
    if (quantity > 0) {
        cart[productId] = quantity;
    } else {
        delete cart[productId];
    }
    saveCartToStorage(cart);
}

// Remove product from cart in localStorage
function removeFromCartStorage(productId) {
    const cart = getCartFromStorage();
    delete cart[productId];
    saveCartToStorage(cart);
}

// Update all UI elements with cart quantity for a product
function updateProductUI(productId) {
    const cartQty = getCartQuantity(productId);
    
    // Update ProductCards on the page
    document.querySelectorAll(`.product-card[data-product-id="${productId}"]`).forEach(card => {
        const stock = parseInt(card.dataset.stock || 0);
        const addToCartBtn = card.querySelector('.add-to-cart');
        const stockWarning = card.querySelector('.stock-warning');
        
        const availableStock = stock - cartQty;
        
        if (addToCartBtn) {
            if (cartQty >= stock && stock > 0) {
                addToCartBtn.classList.add('out-of-stock');
                addToCartBtn.classList.remove('btn-primary');
                addToCartBtn.classList.add('btn-secondary');
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
            } else if (stock === 0) {
                addToCartBtn.classList.add('out-of-stock');
                addToCartBtn.classList.remove('btn-primary');
                addToCartBtn.classList.add('btn-secondary');
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
            } else {
                addToCartBtn.classList.remove('out-of-stock');
                addToCartBtn.classList.add('btn-primary');
                addToCartBtn.classList.remove('btn-secondary');
                addToCartBtn.disabled = false;
                addToCartBtn.innerHTML = 'Add to Cart';
            }
        }
        
        // Update stock warning - hide when out of stock
        if (stockWarning) {
            if (availableStock <= 0) {
                // Hide stock warning completely when out of stock
                stockWarning.style.display = 'none';
            } else if (availableStock <= 5) {
                stockWarning.textContent = `⚠ Only ${availableStock} left in stock`;
                stockWarning.style.display = 'block';
            } else {
                stockWarning.style.display = 'none';
            }
        }
    });
    
    // Update Product Details page
    const detailSection = document.getElementById('product-details-section');
    if (detailSection && parseInt(detailSection.dataset.productId) === productId) {
        const stock = parseInt(detailSection.dataset.stock || 0);
        const addToCartBtn = detailSection.querySelector('.detail-add-to-cart');
        const stockInfo = detailSection.querySelector('.stock-info');
        
        const availableStock = stock - cartQty;
        
        if (addToCartBtn) {
            if (cartQty >= stock && stock > 0) {
                addToCartBtn.classList.add('out-of-stock');
                addToCartBtn.classList.remove('btn-primary');
                addToCartBtn.classList.add('btn-secondary');
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
            } else if (stock === 0) {
                addToCartBtn.classList.add('out-of-stock');
                addToCartBtn.classList.remove('btn-primary');
                addToCartBtn.classList.add('btn-secondary');
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
            } else {
                addToCartBtn.classList.remove('out-of-stock');
                addToCartBtn.classList.add('btn-primary');
                addToCartBtn.classList.remove('btn-secondary');
                addToCartBtn.disabled = false;
                addToCartBtn.innerHTML = '<i class="bi bi-cart"></i> Add to Cart';
            }
        }
        
        // Update stock info display
        if (stockInfo) {
            // Only show stock message when availableStock > 0
            if (availableStock > 0 && availableStock <= 5) {
                stockInfo.innerHTML = `<small class="text-warning">⚠ Only ${availableStock} more left</small>`;
                stockInfo.style.display = 'block';
            } else if (availableStock > 0) {
                stockInfo.innerHTML = `<small class="text-muted">Stock: ${stock}</small>`;
                stockInfo.style.display = 'block';
            } else {
                // availableStock <= 0 - hide the stock message completely
                stockInfo.style.display = 'none';
            }
        }
    }
}

// Initialize stock UI for all products on page
function initStockUI() {
    const cart = getCartFromStorage();
    
    // Update all ProductCards on the page
    document.querySelectorAll('.product-card[data-product-id]').forEach(card => {
        const productId = parseInt(card.dataset.productId);
        const stock = parseInt(card.dataset.stock || 0);
        const cartQty = cart[productId] || 0;
        const availableStock = stock - cartQty;
        const addToCartBtn = card.querySelector('.add-to-cart');
        const stockWarning = card.querySelector('.stock-warning');
        
        // Set initial button state
        if (addToCartBtn) {
            if (stock === 0) {
                addToCartBtn.classList.add('out-of-stock');
                addToCartBtn.classList.remove('btn-primary');
                addToCartBtn.classList.add('btn-secondary');
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
            } else if (cartQty >= stock) {
                addToCartBtn.classList.add('out-of-stock');
                addToCartBtn.classList.remove('btn-primary');
                addToCartBtn.classList.add('btn-secondary');
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
            }
        }
        
        // Set initial stock warning state - hide when out of stock
        if (stockWarning) {
            if (availableStock <= 0) {
                stockWarning.style.display = 'none';
            } else if (availableStock <= 5) {
                stockWarning.textContent = `⚠ Only ${availableStock} left in stock`;
                stockWarning.style.display = 'block';
            } else {
                stockWarning.style.display = 'none';
            }
        }
    });
    
    // Initialize Product Details page specifically
    initProductDetailsStock();
}

// Initialize Product Details page stock display on page load
function initProductDetailsStock() {
    const detailSection = document.getElementById('product-details-section');
    if (!detailSection) return;
    
    const productId = parseInt(detailSection.dataset.productId);
    const stock = parseInt(detailSection.dataset.stock || 0);
    const cartQty = getCartQuantity(productId);
    const availableStock = stock - cartQty;
    const addToCartBtn = detailSection.querySelector('.detail-add-to-cart');
    const stockInfo = detailSection.querySelector('.stock-info');
    
    // Set initial button state
    if (addToCartBtn) {
        if (stock === 0) {
            addToCartBtn.classList.add('out-of-stock');
            addToCartBtn.classList.remove('btn-primary');
            addToCartBtn.classList.add('btn-secondary');
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
        } else if (cartQty >= stock) {
            addToCartBtn.classList.add('out-of-stock');
            addToCartBtn.classList.remove('btn-primary');
            addToCartBtn.classList.add('btn-secondary');
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
        }
    }
    
    // Set initial stock message
    if (stockInfo) {
        if (availableStock <= 0) {
            // Hide stock message completely when out of stock
            stockInfo.style.display = 'none';
        } else if (availableStock <= 5) {
            stockInfo.innerHTML = `<small class="text-warning">⚠ Only ${availableStock} more left</small>`;
            stockInfo.style.display = 'block';
        } else {
            stockInfo.innerHTML = `<small class="text-muted">Stock: ${stock}</small>`;
            stockInfo.style.display = 'block';
        }
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    initNavbarScroll();
    initProductCards();
    initCartAnimations();
    initSearchEffects();
    initStockUI();
});

/* =====================================================
    NAVBAR SCROLL EFFECT
    ===================================================== */

function initNavbarScroll() {
    const navbar = document.getElementById('main-navbar');

    if (!navbar) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* =====================================================
    PRODUCT CARDS - Gaming Hover Effects
    ===================================================== */

function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}

/* =====================================================
    CART OPERATIONS WITH ANIMATIONS
    ===================================================== */

function initCartAnimations() {
    const cart_count = document.getElementById("cart-count");

    if (cart_count) {
        loadCartCount();
    }

    // Cart quantity operations
    document.addEventListener("click", function (e) {
        const cartItem = e.target.closest(".cart-item");
        if (!cartItem) return;

        const productId = cartItem.dataset.productId;
        const cartSection = document.getElementById("cart-page");

        if (!cartSection) return;

        const plusUrl = cartSection.dataset.plusUrl;
        const minusUrl = cartSection.dataset.minusUrl;
        const removeUrl = cartSection.dataset.removeUrl;

        // Get CSRF token
        const csrftoken = getCookie("csrftoken");

        // Increase quantity
        if (e.target.classList.contains("qty-plus")) {
            const btn = e.target;
            btn.classList.add('loading');
            btn.innerHTML = '<span class="loading"></span>';

            fetch(plusUrl, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `product_id=${productId}`
            })
                .then(res => res.json())
                .then(data => {
                    const qtyEl = cartItem.querySelector(".qty");
                    const subtotalEl = cartItem.querySelector(".subtotal");
                    qtyEl.innerText = data.quantity;
                    subtotalEl.innerText = "₹" + parseFloat(data.subtotal).toFixed(2);
                    animateUpdate(qtyEl);
                    updateOrderSummary(data.total_qty, data.total_price);
                    updateCartBadge(data.cart_count);
                    
                    // Update localStorage and UI
                    setCartQuantity(productId, data.quantity);
                    updateProductUI(productId);
                })
                .finally(() => {
                    btn.classList.remove('loading');
                    btn.innerHTML = '+';
                });
        }

        // Decrease quantity
        if (e.target.classList.contains("qty-minus")) {
            const btn = e.target;
            btn.classList.add('loading');
            btn.innerHTML = '<span class="loading"></span>';

            fetch(minusUrl, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `product_id=${productId}`
            })
                .then(res => res.json())
                .then(data => {
                    if (data.deleted) {
                        animateRemove(cartItem);
                        // Update localStorage and UI
                        removeFromCartStorage(productId);
                        updateProductUI(productId);
                    } else {
                        const qtyEl = cartItem.querySelector(".qty");
                        const subtotalEl = cartItem.querySelector(".subtotal");
                        qtyEl.innerText = data.quantity;
                        subtotalEl.innerText = "₹" + parseFloat(data.subtotal).toFixed(2);
                        animateUpdate(qtyEl);
                        // Update localStorage and UI
                        setCartQuantity(productId, data.quantity);
                        updateProductUI(productId);
                    }
                    updateOrderSummary(data.total_qty, data.total_price);
                    updateCartBadge(data.cart_count);
                })
                .finally(() => {
                    btn.classList.remove('loading');
                    btn.innerHTML = '-';
                });
        }

        // Remove item
        if (e.target.classList.contains("remove-item")) {
            const btn = e.target;
            btn.classList.add('loading');

            fetch(removeUrl, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `product_id=${productId}`
            })
                .then(res => res.json())
                .then(data => {
                    animateRemove(cartItem);
                    updateOrderSummary(data.total_qty, data.total_price);
                    updateCartBadge(data.cart_count);
                    
                    // Update localStorage and UI
                    removeFromCartStorage(productId);
                    updateProductUI(productId);
                })
                .finally(() => {
                    btn.classList.remove('loading');
                });
        }
    });
}

// Load cart count
async function loadCartCount() {
    const cart_count = document.getElementById("cart-count");
    if (!cart_count) return;

    const countUrl = cart_count.dataset.countUrl;
    try {
        const result = await fetch(countUrl);
        const data = await result.json();
        cart_count.innerText = data.cart_count;

        // Animate the cart count update
        animateUpdate(cart_count);
    }
    catch (error) {
        console.error(`Cart count fetch error : ${error}`)
    }
}

// Add to cart with gaming animation
const products_container = document.getElementById('products-container');

if (products_container) {
    const addUrl = products_container.dataset.addUrl;
    const csrfToken = document.querySelector("[name = csrfmiddlewaretoken]").value;

    products_container.addEventListener('click', async function (event) {
        if (!event.target.classList.contains('add-to-cart')) {
            return;
        }

        const btn = event.target;
        const product_card = btn.closest(".product-card");
        const productId = product_card.dataset.productId;
        const stock = parseInt(product_card.dataset.stock || 0);
        
        // Check stock before adding
        const currentCartQty = getCartQuantity(productId);
        if (currentCartQty >= stock) {
            // Already at max stock, disable button
            btn.classList.add('out-of-stock');
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
            return;
        }

        // Gaming button animation
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span>';
        btn.style.background = 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)';

        try {
            const response = await fetch(addUrl, {
                method: "POST",
                headers: {
                    'X-CSRFToken': csrfToken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `product_id=${productId}`
            });
            const data = await response.json();

            if (response.status === 401 && data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
            }

            if (data.cart_count !== undefined) {
                const cartBadge = document.getElementById('cart-count');
                if (cartBadge) {
                    cartBadge.innerText = data.cart_count;
                    animateUpdate(cartBadge);
                }
                
                // Update localStorage and UI
                const newQty = currentCartQty + 1;
                setCartQuantity(productId, newQty);
                updateProductUI(productId);
            }

            // Success feedback
            btn.innerHTML = '<i class="bi bi-check-lg"></i> Added!';
            btn.style.background = 'linear-gradient(135deg, #00e676 0%, #00e676 100%)';

        }
        catch (error) {
            console.error("Cart error:", error);
            btn.innerHTML = '<i class="bi bi-x-lg"></i> Error';
            btn.style.background = 'linear-gradient(135deg, #ff4081 0%, #ff5250 100%)';
        }

        setTimeout(() => {
            btn.disabled = false;
            btn.innerText = originalText;
            btn.style.background = '';
            // Re-check stock after timeout
            updateProductUI(productId);
        }, 1500);
    });
}

/* =====================================================
    PRODUCT DETAIL - Add to Cart
    ===================================================== */

const detailSection = document.getElementById('product-details-section');

if (detailSection) {
    const addUrl = detailSection.dataset.addUrl;
    const productId = parseInt(detailSection.dataset.productId);
    const stock = parseInt(detailSection.dataset.stock || 0);

    detailSection.addEventListener('click', async function (event) {
        if (!event.target.closest('.detail-add-to-cart')) return;

        const btn = event.target.closest('.detail-add-to-cart');
        
        // Check stock before adding
        const currentCartQty = getCartQuantity(productId);
        if (currentCartQty >= stock) {
            // Already at max stock, disable button
            btn.classList.add('out-of-stock');
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-cart-x"></i> Out of Stock';
            return;
        }

        const csrftoken = getCookie('csrftoken');
        const originalHTML = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Adding...';

        try {
            const response = await fetch(addUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `product_id=${productId}`
            });
            const data = await response.json();

            if (response.status === 401 && data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
            }

            if (data.cart_count !== undefined) {
                updateCartBadge(data.cart_count);
                
                // Update localStorage and UI
                const newQty = currentCartQty + 1;
                setCartQuantity(productId, newQty);
                updateProductUI(productId);
            }

            btn.innerHTML = '<i class="bi bi-check-lg"></i> Added!';
            btn.style.background = 'linear-gradient(135deg, #00e676 0%, #00e676 100%)';
        } catch (error) {
            console.error('Add to cart error:', error);
            btn.innerHTML = '<i class="bi bi-x-lg"></i> Error';
            btn.style.background = 'linear-gradient(135deg, #ff4081 0%, #ff5250 100%)';
        }

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            // Re-check stock after timeout
            updateProductUI(productId);
        }, 1500);
    });
}

/* =====================================================
    SEARCH EFFECTS
    ===================================================== */

function initSearchEffects() {
    const searchInputs = document.querySelectorAll('.search-box input, .form-control[type="search"]');

    searchInputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    });
}

/* =====================================================
    ANIMATION UTILITIES
    ===================================================== */

function animateUpdate(element) {
    element.style.transform = 'scale(1.3)';
    element.style.transition = 'transform 0.2s ease';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// Update order summary totals
function updateOrderSummary(totalQty, totalPrice) {
    const totalItemsEl = document.getElementById('summary-total-items');
    const totalPriceEl = document.getElementById('summary-total-price');
    if (totalItemsEl) {
        totalItemsEl.innerText = totalQty;
        animateUpdate(totalItemsEl);
    }
    if (totalPriceEl) {
        totalPriceEl.innerText = '₹' + parseFloat(totalPrice).toFixed(2);
        animateUpdate(totalPriceEl);
    }
}

// Update cart badge count in header
function updateCartBadge(count) {
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.innerText = count;
        animateUpdate(cartBadge);
    }
}

function animateRemove(element) {
    element.style.transition = 'all 0.3s ease';
    element.style.transform = 'translateX(100%)';
    element.style.opacity = '0';

    setTimeout(() => {
        element.remove();

        // Check if cart is empty
        const cartItems = document.querySelectorAll('.cart-item');
        if (cartItems.length === 0) {
            const emptyCart = document.querySelector('.empty-cart');
            if (emptyCart) {
                emptyCart.style.display = 'block';
            }
        }
    }, 300);
}

/* =====================================================
    UTILITY FUNCTIONS
    ===================================================== */

// Get cookie by name
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed`;
    notification.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? 'rgba(0, 230, 118, 0.9)' : 'rgba(255, 61, 0, 0.9)'};
        border: none;
        color: white;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    `;
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loading .loading {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        display: inline-block;
        margin-right: 8px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .product-card:hover .product-image-container img {
        transform: scale(1.1);
    }
    
    .product-actions {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
    
    .product-card:hover .product-actions {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

/* =====================================================
    SMOOTH SCROLL FOR ANCHOR LINKS
    ===================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* =====================================================
    RAZORPAY BUTTON STYLING
    ===================================================== */

function styleRazorpayButton() {
    // Target Razorpay buttons
    const razorpayButtons = document.querySelectorAll('.razorpay-payment-button');
    
    razorpayButtons.forEach(button => {
        // Only apply if not already styled
        if (!button.classList.contains('razorpay-styled')) {
            button.classList.add('razorpay-styled');
            
            // Apply inline styles to override Razorpay defaults
            button.style.background = 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
            button.style.border = 'none';
            button.style.borderRadius = '8px';
            button.style.padding = '14px 32px';
            button.style.fontFamily = "'Rajdhani', sans-serif";
            button.style.fontWeight = '700';
            button.style.textTransform = 'uppercase';
            button.style.letterSpacing = '2px';
            button.style.fontSize = '14px';
            button.style.color = '#ffffff';
            button.style.cursor = 'pointer';
            button.style.display = 'inline-block';
            button.style.textDecoration = 'none';
            button.style.lineHeight = '1';
            button.style.height = 'auto';
            button.style.minWidth = '180px';
            button.style.transition = 'all 0.3s ease';
            button.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.4)';
            
            // Add hover effect
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.6)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.4)';
            });
        }
    });
}

// Run on page load
styleRazorpayButton();

// Use MutationObserver to handle dynamically added Razorpay buttons
const razorpayObserver = new MutationObserver(function(mutations) {
    styleRazorpayButton();
});

// Start observing the document body for added nodes
razorpayObserver.observe(document.body, {
    childList: true,
    subtree: true
});

/* =====================================================
    INTERSECTION OBSERVER FOR ANIMATIONS
    ===================================================== */

// Add fade-in animation to elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in animation to cards
document.querySelectorAll('.card, .product-card').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(el);
});


// out of stock btn that functions

/* =====================================================
    PRODUCT IMAGE CAROUSEL NAVIGATION
    (Moved from: productImageCarousel.html)
    
    This function scrolls the carousel to a specific media item
    when editing or deleting images/videos.
    Data attributes are passed from Django template:
    - data-target-image-pk: Image PK to scroll to
    - data-target-video-pk: Video PK to scroll to
    ===================================================== */

function initProductCarouselScroll() {
    const carousel = document.getElementById('productImageCarousel');
    if (!carousel) return;

    // Get target PK from data attributes (set by Django template)
    const targetImagePk = carousel.dataset.targetImagePk;
    const targetVideoPk = carousel.dataset.targetVideoPk;

    // Determine which media to scroll to (image takes priority)
    const targetId = targetImagePk || targetVideoPk;

    if (targetId) {
        const targetItem = carousel.querySelector('[data-media-id="' + targetId + '"]');
        if (targetItem) {
            let carouselInstance = bootstrap.Carousel.getInstance(carousel);
            if (!carouselInstance) {
                carouselInstance = new bootstrap.Carousel(carousel, {
                    interval: false,
                    ride: false
                });
            }

            // Find the index of the target item
            const items = carousel.querySelectorAll('.carousel-item');
            let targetIndex = 0;
            items.forEach(function (item, index) {
                if (item === targetItem) {
                    targetIndex = index;
                }
            });

            // Scroll to the target item
            carouselInstance.to(targetIndex);

            // Add a temporary highlight effect
            targetItem.style.opacity = '0.5';
            setTimeout(function () {
                targetItem.style.opacity = '1';
            }, 300);
        }
    }
}

/* =====================================================
    GAMING ALERTS - Notifications
    ===================================================== */

function initGamingAlerts() {
    const alerts = document.querySelectorAll('.gaming-alert');
    
    alerts.forEach(alert => {
        const dismissTime = alert.dataset.autoDismiss || 5000;
        
        // Start auto-dismiss timer with progress bar
        if (dismissTime > 0) {
            const progressBar = alert.querySelector('.alert-progress-bar');
            if (progressBar) {
                progressBar.style.animationDuration = dismissTime + 'ms';
            }
            
            setTimeout(() => {
                dismissGamingAlert(alert.querySelector('.alert-dismiss'));
            }, dismissTime);
        }
    });
}

function dismissGamingAlert(button) {
    const alert = button.closest('.gaming-alert');
    if (!alert) return;
    
    // Add exit animation
    alert.style.animation = 'gamingAlertFadeOut 0.3s ease forwards';
    
    // Remove from DOM after animation
    setTimeout(() => {
        alert.style.animation = 'gamingAlertSlideOut 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
        
        setTimeout(() => {
            alert.remove();
            
            // Check if no more alerts
            const container = document.querySelector('.gaming-alerts-container');
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 400);
    }, 300);
}

// Initialize gaming alerts on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    initGamingAlerts();
});
