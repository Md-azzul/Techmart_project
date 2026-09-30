document.addEventListener("DOMContentLoaded", () => {

    // --- SECTION 1: VIEW ROUTING LOGIC ENGINE ---
    const storeView = document.getElementById("store-front-view");
    const cartView = document.getElementById("shopping-cart-view");
    
    const cartToggle = document.getElementById("cart-toggle-btn");
    const navHome = document.getElementById("nav-home");
    const navShop = document.getElementById("nav-shop");
    const navLogo = document.getElementById("nav-logo");
    const heroShopBtn = document.getElementById("hero-shop-btn");

    function showStorefront() {
        cartView.classList.add("hidden-view");
        storeView.classList.remove("hidden-view");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showCartPage() {
        storeView.classList.add("hidden-view");
        cartView.classList.remove("hidden-view");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Bind event listeners to view switches
    cartToggle.addEventListener("click", showCartPage);
    navHome.addEventListener("click", (e) => { e.preventDefault(); showStorefront(); });
    navShop.addEventListener("click", (e) => { e.preventDefault(); showStorefront(); });
    navLogo.addEventListener("click", showStorefront);
    if(heroShopBtn) { heroShopBtn.addEventListener("click", showStorefront); }


    // --- SECTION 2: 3D SHOWCASE ANIMATION LOOP ---
    const heroCard = document.getElementById('hero-card');
    const icons = ['💻', '🎧', '⌚', '🔋'];
    let currentIndex = 0;

    if (heroCard) {
        setInterval(() => {
            heroCard.style.transform = 'scale(0) rotateY(180deg)';
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % icons.length;
                heroCard.textContent = icons[currentIndex];
                heroCard.style.transform = 'scale(1) rotateY(360deg)';
            }, 300);

            setTimeout(() => {
                heroCard.style.transition = 'none';
                heroCard.style.transform = 'scale(1) rotateY(0deg)';
                heroCard.offsetHeight; // Force layout calculation reflow
                heroCard.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }, 900);
        }, 4000);
    }


    // --- SECTION 3: SHOPPING CART LOGIC AND INTERACTIONS ---
    let cartCount = 0;
    const cartCountBadge = document.getElementById('cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            cartCount++;
            if (cartCountBadge) cartCountBadge.textContent = cartCount;
            
            // Button visual feedback flash transformation state
            const originalText = button.textContent;
            button.textContent = 'Added! ✓';
            button.style.background = '#2ecc71';
            button.style.color = '#fff';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.style.color = '';
            }, 1000);
        });
    });
});

// Standalone global counter modification helper functions
function updateQty(id, change) {
    const qtyElement = document.getElementById(id);
    if (qtyElement) {
        let currentQty = parseInt(qtyElement.textContent);
        currentQty += change;
        if (currentQty < 1) currentQty = 1;
        qtyElement.textContent = currentQty;
    }
}
