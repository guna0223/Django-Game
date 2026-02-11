/* =========================================================================
    GAME SHOP - MAIN JAVASCRIPT
    =========================================================================
    Line: 1-20 | Total Lines: 920

    ========================================================================= */
/* =========================================================================
    SECTION CODES:
    1-20   : Header Info
    1-12   : DOM Init
    14-30  : Navbar Scroll
    32-48  : Product Cards
    50-166 : Cart Animations
    187-250: Add to Cart
    252-306: Product Detail
    308-324: Search Effects
    326-352: Animation Utils
    354-406: Utility Functions
    408-512: Smooth Scroll
    514-556: Intersection Observer
    558-656: Product Carousel
    658-720: Duplicate Product Detail Handler
    720-920: Spider-Loader Animation
    ========================================================================= */

/* =====================================================
    GAMING JAVASCRIPT - Enhanced Interactions
    ===================================================== */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    initNavbarScroll();
    initProductCards();
    initCartAnimations();
    initSearchEffects();
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
                    } else {
                        const qtyEl = cartItem.querySelector(".qty");
                        const subtotalEl = cartItem.querySelector(".subtotal");
                        qtyEl.innerText = data.quantity;
                        subtotalEl.innerText = "₹" + parseFloat(data.subtotal).toFixed(2);
                        animateUpdate(qtyEl);
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
        }, 1500);
    });
}

/* =====================================================
    PRODUCT DETAIL - Add to Cart
    ===================================================== */

const detailSection = document.getElementById('product-details-section');

if (detailSection) {
    const addUrl = detailSection.dataset.addUrl;
    const productId = detailSection.dataset.productId;

    detailSection.addEventListener('click', async function (event) {
        if (!event.target.closest('.detail-add-to-cart')) return;

        const btn = event.target.closest('.detail-add-to-cart');
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

// Initialize on DOM ready (along with other initializations)
document.addEventListener('DOMContentLoaded', function () {
    initProductCarouselScroll();

    const section = document.getElementById('product-details-section');
    const button = document.querySelector('.detail-add-to-cart');

    if (!button) return;

    button.addEventListener('click', function () {

        const stock = parseInt(section.dataset.stock);
        const productId = section.dataset.productId;
        const url = section.dataset.addUrl;
        const qty = parseInt(document.getElementById('quantity').value);

        if (qty > stock) {
            alert(`Only ${stock} item(s) available`);
            return;
        }

        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: qty
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Added to cart');
                }
            });
    });
});

document.addEventListener('DOMContentLoaded', function () {

    const section = document.getElementById('product-details-section');
    const button = document.querySelector('.detail-add-to-cart');

    if (!button) return;

    button.addEventListener('click', function () {

        const stock = parseInt(section.dataset.stock);
        const productId = section.dataset.productId;
        const url = section.dataset.addUrl;
        const qty = parseInt(document.getElementById('quantity').value);

        if (qty > stock) {
            alert(`Only ${stock} item(s) available`);
            return;
        }

        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': '{{ csrf_token }}',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: qty
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Added to cart');
                }
            });
    });
});

/* =========================================================================
   SPIDER-MAN WEB SHOOTER LOADER ANIMATION
   =========================================================================
   
   This file controls the Spider-Man themed loading animation that appears
   when pages load. The animation features:
   
   Features:
   - Web shooting animation from left to right
   - Elastic/stretching web effect
   - Progress bar that fills as content loads
   - Connector points appearing sequentially
   - Rotating text layers (SPINNING → WEAVING → LOADING)
   - Floating web particles
   - Smooth completion animation
   
   Usage:
   - Include loading.html in the template where you want the loader
   - The loader automatically hides when progress reaches 100%
   - Main content fades in after loader completes
   
   ========================================================================= */

/* =====================================================
   LOADER INITIALIZATION
   ===================================================== */

// Wait for DOM to be fully loaded before initializing 
document.addEventListener('DOMContentLoaded', function() {
    
    // Get loader elements
    const spiderLoader = document.getElementById('spider-loader');
    const progressFill = document.getElementById('progress-fill');
    const progressWeb = document.getElementById('progress-web');
    const percentValue = document.getElementById('percent-value');
    const webParticles = document.getElementById('web-particles');
    
    /* =====================================================
       PARTICLE GENERATION
       Creates floating web particles for atmosphere
       ===================================================== */
    
    function createParticles() {
        // Create 15 random particles
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'web-particle';
            // Random horizontal position
            particle.style.left = Math.random() * 100 + '%';
            // Random animation delay
            particle.style.animationDelay = Math.random() * 4 + 's';
            // Random duration
            particle.style.animationDuration = (3 + Math.random() * 3) + 's';
            webParticles.appendChild(particle);
        }
    }
    
    /* =====================================================
       PROGRESS SIMULATION
       Simulates loading progress with variable speed
       ===================================================== */
    
    let progress = 0;
    let currentSpeed = 100;
    const baseSpeed = 80;
    
    // Main progress update function
    function updateProgress() {
        // Phase 1: Slow start (0-35%)
        if (progress < 35) {
            currentSpeed = baseSpeed + Math.random() * 50;
        }
        // Phase 2: Speed up (35-70%)
        else if (progress < 70) {
            currentSpeed = baseSpeed - 30 + Math.random() * 40;
        }
        // Phase 3: Nearly complete (70-90%)
        else if (progress < 90) {
            currentSpeed = baseSpeed - 50 + Math.random() * 30;
        }
        // Phase 4: Final stretch (90-100%)
        else {
            currentSpeed = baseSpeed - 60 + Math.random() * 20;
        }
        
        // Increment progress with randomness
        const increment = Math.random() * 5 + 2;
        progress = Math.min(progress + increment, 100);
        
        /* =====================================================
           UI UPDATES
           Update progress bar, web, and percentage display
           ===================================================== */
        
        // Update main progress bar
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        // Update progress web (starts at 20%)
        if (progressWeb && progress > 20) {
            const webProgress = Math.min((progress - 20) * 1.25, 100);
            progressWeb.style.width = webProgress + '%';
        }
        
        // Update percentage counter
        if (percentValue) {
            percentValue.textContent = Math.floor(progress);
            
            // Pulse effect on milestone updates (every 10%)
            if (Math.floor(progress) % 10 === 0) {
                percentValue.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    percentValue.style.transform = 'scale(1)';
                }, 100);
            }
        }
        
        // Continue or complete
        if (progress < 100) {
            setTimeout(updateProgress, currentSpeed);
        } else {
            completeLoading();
        }
    }
    
    /* =====================================================
       COMPLETION HANDLER
       Handles loader completion animation
       ===================================================== */
    
    function completeLoading() {
        if (spiderLoader) {
            spiderLoader.classList.add('loading-complete');
        }
        
        // Wait for completion animation then hide
        setTimeout(() => {
            hideLoader();
        }, 800);
    }
    
    /* =====================================================
       LOADER HIDDEN
       Fades out loader and shows main content
       ===================================================== */
    
    function hideLoader() {
        if (spiderLoader) {
            spiderLoader.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            spiderLoader.style.opacity = '0';
            spiderLoader.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                spiderLoader.style.display = 'none';
                
                // Show main content with fade in
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.style.transition = 'opacity 0.5s ease';
                    mainContent.style.opacity = '1';
                }
                
                // Show navbar
                const navbar = document.querySelector('.tech-navbar');
                if (navbar) {
                    navbar.style.transition = 'opacity 0.5s ease';
                    navbar.style.opacity = '1';
                }
            }, 500);
        }
    }
    
    /* =====================================================
       INITIALIZE LOADER
       Starts the loading animation sequence
       ===================================================== */
    
    function initLoader() {
        createParticles();
        
        // Start progress after initial setup
        setTimeout(() => {
            updateProgress();
        }, 500);
    }
    
    // Only initialize if loader element exists
    if (spiderLoader) {
        initLoader();
    }
});

/* =========================================================================
   END OF SPIDER-LOADER.JS (Merged into script.js)
   ========================================================================= */
