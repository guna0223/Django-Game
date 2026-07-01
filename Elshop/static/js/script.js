/* =====================================================
   PLAYZONEX - Cart & UI Logic
   ===================================================== */

const CSRF = () => getCookie("csrftoken");

/* =====================================================
   NAVBAR SCROLL
===================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('main-navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

/* =====================================================
   CART BADGE
===================================================== */
function updateCartBadge(count) {
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = count;
        animateUpdate(badge);
    }
}

function loadCartCount() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    fetch(badge.dataset.countUrl)
        .then(r => r.json())
        .then(d => { badge.innerText = d.cart_count; animateUpdate(badge); })
        .catch(e => console.error('Cart count error:', e));
}

/* =====================================================
   ORDER SUMMARY
===================================================== */
function updateOrderSummary(qty, price) {
    const qtyEl = document.getElementById('summary-total-items');
    const priceEl = document.getElementById('summary-total-price');
    if (qtyEl) { qtyEl.innerText = qty; animateUpdate(qtyEl); }
    if (priceEl) { priceEl.innerText = '₹' + parseFloat(price).toFixed(2); animateUpdate(priceEl); }
}

/* =====================================================
   PRODUCT CARD STOCK UI — driven by server data
===================================================== */
function updateProductCardUI(productId, cartQty, maxStock) {
    document.querySelectorAll(`.product-card[data-product-id="${productId}"]`).forEach(card => {
        const avail = maxStock - cartQty;
        const btn = card.querySelector('.add-to-cart');
        const warning = card.querySelector('.stock-warning');

        if (btn) {
            const isOut = avail <= 0;
            btn.disabled = isOut;
            btn.className = `btn btn-sm w-100 mt-2 add-to-cart ${isOut ? 'btn-secondary out-of-stock' : 'btn-primary'}`;
            btn.innerHTML = isOut
                ? '<i class="bi bi-cart-x"></i> Out of Stock'
                : 'Add to Cart';
        }

        if (warning) {
            if (avail <= 0) {
                warning.style.display = 'none';
            } else if (avail <= 5) {
                warning.textContent = `⚠ Only ${avail} left in stock`;
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        }

        // Update data-stock so JS stays in sync
        card.dataset.stock = avail;
    });
}

function updateDetailPageUI(productId, cartQty, maxStock) {
    const section = document.getElementById('product-details-section');
    if (!section || parseInt(section.dataset.productId) !== productId) return;

    const avail = maxStock - cartQty;
    const btn = section.querySelector('.detail-add-to-cart');
    const stockInfo = section.querySelector('.stock-info');

    if (btn) {
        btn.disabled = avail <= 0;
        btn.className = `btn detail-add-to-cart ${avail <= 0 ? 'btn-secondary' : 'btn-primary'}`;
        btn.innerHTML = avail <= 0
            ? '<i class="bi bi-cart-x"></i> Out of Stock'
            : '<i class="bi bi-cart"></i> Add to Cart';
    }

    if (stockInfo) {
        if (avail <= 0) {
            stockInfo.innerHTML = `<small class="text-danger">✕ Out of Stock</small>`;
        } else if (avail <= 5) {
            stockInfo.innerHTML = `<small class="text-warning">⚠ Only ${avail} more left</small>`;
        } else {
            stockInfo.innerHTML = `<small class="text-muted">Stock: ${avail}</small>`;
        }
    }
}

/* =====================================================
   ADD TO CART — Product Cards (home/products pages)
===================================================== */
function initProductCardCart() {
    const container = document.getElementById('products-container');
    if (!container) return;

    const addUrl = container.dataset.addUrl;
    const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;

    container.addEventListener('click', async function (e) {
        if (!e.target.classList.contains('add-to-cart')) return;

        const btn = e.target;
        const card = btn.closest('.product-card');
        const productId = card.dataset.productId;
        const originalHTML = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

        try {
            const res = await fetch(addUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `product_id=${productId}`
            });
            const data = await res.json();

            if (res.status === 401 && data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
            }

            if (res.status === 400 && data.error === 'out_of_stock') {
                showNotification(data.message, 'danger');
                updateProductCardUI(parseInt(productId), data.qty, data.max_stock);
                return;
            }

            updateCartBadge(data.cart_count);
            updateProductCardUI(parseInt(productId), data.qty, data.max_stock);
            showNotification(data.message || 'Added to cart!', 'success');

            btn.innerHTML = '<i class="bi bi-check-lg"></i> Added!';
            btn.style.background = 'linear-gradient(135deg, #00e676, #00e676)';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 1500);

        } catch (err) {
            console.error('Add to cart error:', err);
            btn.innerHTML = '<i class="bi bi-x-lg"></i> Error';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }, 1500);
        }
    });
}

/* =====================================================
   ADD TO CART — Product Detail Page
===================================================== */
function initDetailCart() {
    const section = document.getElementById('product-details-section');
    if (!section) return;

    const addUrl = section.dataset.addUrl;
    const productId = parseInt(section.dataset.productId);

    section.addEventListener('click', async function (e) {
        const btn = e.target.closest('.detail-add-to-cart');
        if (!btn) return;

        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Adding...';

        try {
            const res = await fetch(addUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': CSRF(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `product_id=${productId}`
            });
            const data = await res.json();

            if (res.status === 401 && data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
            }

            if (res.status === 400 && data.error === 'out_of_stock') {
                showNotification(data.message, 'danger');
                updateDetailPageUI(productId, data.qty, data.max_stock);
                return;
            }

            updateCartBadge(data.cart_count);
            updateDetailPageUI(productId, data.qty, data.max_stock);
            updateProductCardUI(productId, data.qty, data.max_stock);
            showNotification(data.message || 'Added to cart!', 'success');

            btn.innerHTML = '<i class="bi bi-check-lg"></i> Added!';
            btn.style.background = 'linear-gradient(135deg, #00e676, #00e676)';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 1500);

        } catch (err) {
            console.error('Detail add to cart error:', err);
            btn.innerHTML = '<i class="bi bi-x-lg"></i> Error';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }, 1500);
        }
    });
}

/* =====================================================
   CART PAGE — +/- /remove with instant UI update
===================================================== */
function initCartPage() {
    const cartSection = document.getElementById('cart-page');
    if (!cartSection) return;

    const plusUrl = cartSection.dataset.plusUrl;
    const minusUrl = cartSection.dataset.minusUrl;
    const removeUrl = cartSection.dataset.removeUrl;

    document.addEventListener('click', async function (e) {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;

        const productId = cartItem.dataset.productId;
        const qtyEl = cartItem.querySelector('.qty');
        const subtotalEl = cartItem.querySelector('.subtotal');
        const plusBtn = cartItem.querySelector('.qty-plus');
        const minusBtn = cartItem.querySelector('.qty-minus');

        // INCREASE
        if (e.target.classList.contains('qty-plus')) {
            plusBtn.disabled = true;
            plusBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

            const res = await fetch(plusUrl, {
                method: 'POST',
                headers: { 'X-CSRFToken': CSRF(), 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `product_id=${productId}`
            });
            const data = await res.json();

            if (res.status === 400 && data.error === 'out_of_stock') {
                showNotification(data.message, 'danger');
                plusBtn.disabled = true; // keep disabled
                plusBtn.innerHTML = '+';
                updateOrderSummary(data.total_qty, data.total_price);
                updateCartBadge(data.cart_count);
                return;
            }

            qtyEl.innerText = data.quantity;
            subtotalEl.innerText = '₹' + parseFloat(data.subtotal).toFixed(2);
            animateUpdate(qtyEl);
            updateOrderSummary(data.total_qty, data.total_price);
            updateCartBadge(data.cart_count);
            updateProductCardUI(parseInt(productId), data.quantity, data.max_stock);

            // Disable + if now at max
            plusBtn.disabled = data.quantity >= data.max_stock;
            plusBtn.innerHTML = '+';
        }

        // DECREASE
        if (e.target.classList.contains('qty-minus')) {
            minusBtn.disabled = true;
            minusBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

            const res = await fetch(minusUrl, {
                method: 'POST',
                headers: { 'X-CSRFToken': CSRF(), 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `product_id=${productId}`
            });
            const data = await res.json();

            if (data.deleted) {
                animateRemove(cartItem);
            } else {
                qtyEl.innerText = data.quantity;
                subtotalEl.innerText = '₹' + parseFloat(data.subtotal).toFixed(2);
                animateUpdate(qtyEl);
                // Re-enable + since qty decreased
                if (plusBtn) plusBtn.disabled = false;
            }

            updateOrderSummary(data.total_qty, data.total_price);
            updateCartBadge(data.cart_count);
            updateProductCardUI(parseInt(productId), data.quantity, data.max_stock || 0);
            minusBtn.disabled = false;
            minusBtn.innerHTML = '-';
        }

        // REMOVE
        if (e.target.classList.contains('remove-item')) {
            const res = await fetch(removeUrl, {
                method: 'POST',
                headers: { 'X-CSRFToken': CSRF(), 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `product_id=${productId}`
            });
            const data = await res.json();
            animateRemove(cartItem);
            updateOrderSummary(data.total_qty, data.total_price);
            updateCartBadge(data.cart_count);
            updateProductCardUI(parseInt(productId), 0, 0);
        }
    });
}

/* =====================================================
   INIT STOCK UI — sync with server on page load
===================================================== */
function initStockUI() {
    // For each product card, fetch real qty from server
    document.querySelectorAll('.product-card[data-product-id]').forEach(card => {
        const productId = card.dataset.productId;
        const stock = parseInt(card.dataset.stock || 0);

        fetch(`/cart/qty/?product_id=${productId}`)
            .then(r => r.json())
            .then(data => {
                updateProductCardUI(parseInt(productId), data.qty, stock);
            })
            .catch(() => {}); // silent fail for guests
    });

    // Detail page sync
    const section = document.getElementById('product-details-section');
    if (section) {
        const productId = parseInt(section.dataset.productId);
        const stock = parseInt(section.dataset.stock || 0);
        fetch(`/cart/qty/?product_id=${productId}`)
            .then(r => r.json())
            .then(data => {
                updateDetailPageUI(productId, data.qty, stock);
            })
            .catch(() => {});
    }
}

/* =====================================================
   ANIMATIONS
===================================================== */
function animateUpdate(el) {
    el.style.transform = 'scale(1.3)';
    el.style.transition = 'transform 0.2s ease';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
}

function animateRemove(el) {
    el.style.transition = 'all 0.3s ease';
    el.style.transform = 'translateX(100%)';
    el.style.opacity = '0';
    setTimeout(() => {
        el.remove();
        const remaining = document.querySelectorAll('.cart-item');
        if (remaining.length === 0) {
            const cartItems = document.querySelector('.cart-items');
            if (cartItems) {
                cartItems.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-cart-x" style="font-size:3rem;color:#888;"></i>
                        <p class="mt-3 text-muted">Your cart is empty</p>
                        <a href="/" class="btn btn-primary mt-2">Shop Now</a>
                    </div>`;
            }
        }
    }, 300);
}

/* =====================================================
   NOTIFICATIONS
===================================================== */
function showNotification(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `alert alert-${type} position-fixed`;
    el.style.cssText = `
        top: 100px; right: 20px; z-index: 10000;
        background: ${type === 'success' ? 'rgba(0,230,118,0.9)' : 'rgba(255,61,0,0.9)'};
        border: none; color: white;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600; text-transform: uppercase;
        letter-spacing: 1px; padding: 12px 20px;
        border-radius: 8px; animation: slideIn 0.3s ease;
    `;
    el.innerText = message;
    document.body.appendChild(el);
    setTimeout(() => { el.style.animation = 'slideOut 0.3s ease'; setTimeout(() => el.remove(), 300); }, 3000);
}

/* =====================================================
   SEARCH
===================================================== */
function initSearchEffects() {
    document.querySelectorAll('.search-box input, .form-control[type="search"]').forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => input.parentElement.classList.remove('focused'));
    });
}

/* =====================================================
   PRODUCT CARDS HOVER
===================================================== */
function initProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-10px)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
    });
}

/* =====================================================
   INTERSECTION OBSERVER
===================================================== */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.card, .product-card').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.5s ease ${i * 0.1}s`;
        observer.observe(el);
    });
}

/* =====================================================
   GAMING ALERTS
===================================================== */
function initGamingAlerts() {
    document.querySelectorAll('.gaming-alert').forEach(alert => {
        const t = alert.dataset.autoDismiss || 5000;
        setTimeout(() => {
            const btn = alert.querySelector('.alert-dismiss');
            if (btn) btn.click();
            else alert.remove();
        }, t);
    });
}

/* =====================================================
   RAZORPAY BUTTON
===================================================== */
function styleRazorpayButton() {
    document.querySelectorAll('.razorpay-payment-button:not(.razorpay-styled)').forEach(btn => {
        btn.classList.add('razorpay-styled');
        Object.assign(btn.style, {
            background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
            border: 'none', borderRadius: '8px',
            padding: '14px 32px', color: '#fff',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '2px', cursor: 'pointer',
        });
    });
}

/* =====================================================
   CSS ANIMATIONS
===================================================== */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity:1; } to { transform: translateX(100%); opacity:0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

/* =====================================================
   COOKIE UTIL
===================================================== */
function getCookie(name) {
    return document.cookie.split(';')
        .map(c => c.trim())
        .find(c => c.startsWith(name + '='))
        ?.split('=')[1]
        ? decodeURIComponent(document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='))?.split('=')[1])
        : null;
}

/* =====================================================
   PASSWORD TOGGLES
===================================================== */
function initPasswordToggles() {
    document.querySelectorAll('input[type="password"]').forEach(input => {
        if (input.parentElement.classList.contains('password-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'password-wrapper position-relative';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const icon = document.createElement('i');
        icon.className = 'bi bi-eye-slash password-toggle-icon';
        wrapper.appendChild(icon);
        
        icon.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye password-toggle-icon text-primary';
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye-slash password-toggle-icon';
            }
        });
    });
}

/* =====================================================
   BOOT & TURBO SUPPORT
===================================================== */
function initializeApp() {
    loadCartCount();
    initNavbarScroll();
    initProductCards();
    initCartPage();
    initProductCardCart();
    initDetailCart();
    initSearchEffects();
    initScrollAnimations();
    initGamingAlerts();
    styleRazorpayButton();
    initStockUI();
    initPasswordToggles();
}

document.addEventListener('DOMContentLoaded', initializeApp);
document.addEventListener('turbo:load', initializeApp);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Razorpay observer
new MutationObserver(styleRazorpayButton).observe(document.body, { childList: true, subtree: true });