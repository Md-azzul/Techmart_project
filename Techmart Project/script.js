document.addEventListener("DOMContentLoaded", () => {

    // ---------- DATA ----------
    const PRODUCTS = [
        { id: 1,  icon: "🎧",  name: "Wireless Headphones",     desc: "Premium Audio Gear",     price: 199,  cat: "Audio" },
        { id: 2,  icon: "⌚",  name: "Smart Watch Series 9",    desc: "Fitness & Alerts",       price: 299,  cat: "Wearables" },
        { id: 3,  icon: "🔋",  name: "MagSafe Power Bank",      desc: "Fast Charging",          price: 49,   cat: "Accessories" },
        { id: 4,  icon: "⌨️",  name: "Mechanical Keyboard",     desc: "Tactile Typing",         price: 129,  cat: "Computers" },
        { id: 5,  icon: "💻",  name: "UltraBook Pro 14\"",      desc: "Thin & Powerful Laptop", price: 1299, cat: "Computers" },
        { id: 6,  icon: "📱",  name: "Smartphone X12",          desc: "6.5\" OLED Display",     price: 899,  cat: "Phones & Tablets" },
        { id: 7,  icon: "🖱️",  name: "Wireless Mouse",          desc: "Ergonomic Design",       price: 39,   cat: "Computers" },
        { id: 8,  icon: "🖥️",  name: "27\" 4K Monitor",         desc: "Sharp Color Accuracy",   price: 349,  cat: "Computers" },
        { id: 9,  icon: "📷",  name: "Mirrorless Camera",       desc: "24MP Sensor",            price: 749,  cat: "Cameras" },
        { id: 10, icon: "🔊",  name: "Bluetooth Speaker",       desc: "Waterproof Sound",       price: 89,   cat: "Audio" },
        { id: 11, icon: "🎮",  name: "Game Controller",         desc: "Wireless Gamepad",       price: 59,   cat: "Gaming" },
        { id: 12, icon: "📲",  name: "Tablet Air 11\"",         desc: "Light & Fast Tablet",    price: 499,  cat: "Phones & Tablets" },
        { id: 13, icon: "🔌",  name: "65W Fast Charger",        desc: "USB-C, 2 Ports",         price: 35,   cat: "Accessories" },
        { id: 14, icon: "💾",  name: "Portable SSD 1TB",        desc: "1000 MB/s Transfer",     price: 119,  cat: "Accessories" },
        { id: 15, icon: "📹",  name: "HD Webcam 1080p",         desc: "Built-in Microphone",    price: 69,   cat: "Cameras" },
        { id: 16, icon: "🎙️",  name: "USB Microphone",          desc: "Studio-Quality Voice",   price: 99,   cat: "Audio" },
        { id: 17, icon: "🎧",  name: "True Wireless Earbuds",   desc: "Noise Cancelling",       price: 129,  cat: "Audio" },
        { id: 18, icon: "🏃",  name: "Fitness Band",            desc: "14-Day Battery",         price: 59,   cat: "Wearables" },
        { id: 19, icon: "🖨️",  name: "Wireless Printer",        desc: "Print, Scan, Copy",      price: 159,  cat: "Computers" },
        { id: 20, icon: "📡",  name: "Wi-Fi 6 Router",          desc: "Whole-Home Coverage",    price: 129,  cat: "Accessories" },
        { id: 21, icon: "🥽",  name: "VR Headset",              desc: "Standalone Virtual Reality", price: 399, cat: "Gaming" },
        { id: 22, icon: "🚁",  name: "Camera Drone",            desc: "4K Aerial Video",        price: 599,  cat: "Cameras" },
        { id: 23, icon: "📽️",  name: "Smart Projector",         desc: "1080p Home Cinema",      price: 279,  cat: "Cameras" },
        { id: 24, icon: "🔔",  name: "Video Doorbell",          desc: "HD Video & Night Vision", price: 119, cat: "Cameras" }
    ];
    const FREE_SHIPPING_MIN = 100;
    const SHIPPING_FEE = 9.99;

    // ---------- SAFE STORAGE HELPERS ----------
    function load(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }
    function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    }

    // ---------- STATE ----------
    let users = load("tm_users", []);          // DEMO ONLY: real sites need a server
    let currentUser = load("tm_session", null); // { name, email }
    let cart = load("tm_cart", []);             // [{ id, qty }]
    let authMode = "login";

    // ---------- ELEMENTS ----------
    const $ = (id) => document.getElementById(id);
    const views = {
        login: $("login-view"),
        store: $("store-front-view"),
        cart: $("shopping-cart-view"),
        about: $("about-view"),
        contact: $("contact-view")
    };
    const navbar = $("navbar");

    // ---------- VIEW ROUTER ----------
    function showView(name) {
        // Not logged in? Always send to login.
        if (!currentUser && name !== "login") name = "login";

        Object.values(views).forEach(v => v.classList.add("hidden-view"));
        views[name].classList.remove("hidden-view");
        navbar.classList.toggle("hidden-view", name === "login");
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (name === "cart") renderCart();
    }

    function toast(message) {
        const t = $("toast");
        t.textContent = message;
        t.classList.add("show");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => t.classList.remove("show"), 2200);
    }

    // ---------- AUTH ----------
    function setAuthMode(mode) {
        authMode = mode;
        const isLogin = mode === "login";
        $("auth-title").textContent = isLogin ? "Log in" : "Create account";
        $("auth-sub").textContent = isLogin
            ? "Welcome back. Enter your details to continue."
            : "Sign up to start shopping.";
        $("auth-submit").textContent = isLogin ? "Log in" : "Create account";
        $("auth-switch-text").textContent = isLogin ? "New to TechMart?" : "Already have an account?";
        $("auth-switch-link").textContent = isLogin ? "Create an account" : "Log in";
        $("name-field").classList.toggle("hidden-view", isLogin);
        $("auth-password").autocomplete = isLogin ? "current-password" : "new-password";
        $("auth-error").textContent = "";
    }

    function validEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function startSession(user) {
        currentUser = { name: user.name, email: user.email };
        save("tm_session", currentUser);
        $("user-greeting").textContent = "Hi, " + currentUser.name;
        $("contact-name").value = currentUser.name;
        $("contact-email").value = currentUser.email;
        $("auth-form").reset();
        $("auth-error").textContent = "";
        updateCartBadge();
        showView("store");          // <-- redirect to the next page after login
    }

    $("auth-switch-link").addEventListener("click", (e) => {
        e.preventDefault();
        setAuthMode(authMode === "login" ? "register" : "login");
    });

    $("auth-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = $("auth-email").value.trim().toLowerCase();
        const password = $("auth-password").value;
        const name = $("auth-name").value.trim();
        const error = $("auth-error");

        if (!validEmail(email)) { error.textContent = "Enter a valid email address."; return; }
        if (password.length < 6) { error.textContent = "Password must be at least 6 characters."; return; }

        if (authMode === "register") {
            if (!name) { error.textContent = "Enter your full name."; return; }
            if (users.some(u => u.email === email)) {
                error.textContent = "An account with this email already exists. Log in instead.";
                return;
            }
            const user = { name, email, password };
            users.push(user);
            save("tm_users", users);
            startSession(user);
        } else {
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) { error.textContent = "Incorrect email or password."; return; }
            startSession(user);
        }
    });

    $("logout-btn").addEventListener("click", () => {
        currentUser = null;
        save("tm_session", null);
        setAuthMode("login");
        showView("login");
    });

    // ---------- NAVIGATION ----------
    $("cart-toggle-btn").addEventListener("click", () => showView("cart"));
    $("nav-home").addEventListener("click", (e) => { e.preventDefault(); showView("store"); });
    $("nav-shop").addEventListener("click", (e) => {
        e.preventDefault();
        showView("store");
        $("products-section").scrollIntoView({ behavior: "smooth" });
    });
    $("nav-about").addEventListener("click", (e) => { e.preventDefault(); showView("about"); });
    $("nav-contact").addEventListener("click", (e) => { e.preventDefault(); showView("contact"); });
    $("about-shop-btn").addEventListener("click", () => {
        showView("store");
        $("products-section").scrollIntoView({ behavior: "smooth" });
    });
    $("about-contact-btn").addEventListener("click", () => showView("contact"));
    $("nav-logo").addEventListener("click", () => showView("store"));
    $("nav-logo").addEventListener("keydown", (e) => { if (e.key === "Enter") showView("store"); });
    $("hero-shop-btn").addEventListener("click", () => {
        $("products-section").scrollIntoView({ behavior: "smooth" });
    });

    // ---------- HERO ANIMATION ----------
    const heroCard = $("hero-card");
    const icons = ["💻", "🎧", "⌚", "🔋"];
    let iconIndex = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (heroCard && !reduceMotion) {
        setInterval(() => {
            heroCard.style.transform = "scale(0) rotateY(180deg)";
            setTimeout(() => {
                iconIndex = (iconIndex + 1) % icons.length;
                heroCard.textContent = icons[iconIndex];
                heroCard.style.transform = "scale(1) rotateY(360deg)";
            }, 300);
            setTimeout(() => {
                heroCard.style.transition = "none";
                heroCard.style.transform = "scale(1) rotateY(0deg)";
                void heroCard.offsetHeight; // force reflow
                heroCard.style.transition = "";
            }, 900);
        }, 4000);
    }

    // ---------- PRODUCTS ----------
    const money = (n) => "$" + n.toFixed(2);

    const CATEGORIES = ["All"].concat(Array.from(new Set(PRODUCTS.map(p => p.cat))));
    let activeCategory = "All";

    function renderFilters() {
        const bar = $("filter-bar");
        bar.innerHTML = "";
        CATEGORIES.forEach(cat => {
            const b = document.createElement("button");
            b.className = "filter-btn" + (cat === activeCategory ? " active" : "");
            b.textContent = cat;
            b.dataset.cat = cat;
            bar.appendChild(b);
        });
    }

    function renderProducts() {
        const grid = $("product-grid");
        grid.innerHTML = "";
        PRODUCTS.filter(p => activeCategory === "All" || p.cat === activeCategory).forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML =
                '<div class="product-img">' + p.icon + "</div>" +
                '<p class="product-cat">' + p.cat + "</p>" +
                "<h3>" + p.name + "</h3>" +
                '<p class="price">' + money(p.price) + "</p>" +
                '<button class="add-to-cart-btn" data-id="' + p.id + '">Add to Cart</button>';
            grid.appendChild(card);
        });
    }

    // Listeners are attached once (not on every re-render)
    $("filter-bar").addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        activeCategory = btn.dataset.cat;
        renderFilters();
        renderProducts();
    });

    $("product-grid").addEventListener("click", (e) => {
        const btn = e.target.closest(".add-to-cart-btn");
        if (!btn) return;
        addToCart(Number(btn.dataset.id));
        btn.textContent = "Added! ✓";
        btn.classList.add("added");
        setTimeout(() => {
            btn.textContent = "Add to Cart";
            btn.classList.remove("added");
        }, 1000);
    });

    // ---------- CART LOGIC ----------
    function persistCart() { save("tm_cart", cart); }

    function updateCartBadge() {
        $("cart-count").textContent = cart.reduce((sum, i) => sum + i.qty, 0);
    }

    function addToCart(id) {
        const existing = cart.find(i => i.id === id);
        if (existing) existing.qty++;
        else cart.push({ id, qty: 1 });
        persistCart();
        updateCartBadge();
    }

    function changeQty(id, change) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty = Math.max(1, item.qty + change);
        persistCart();
        updateCartBadge();
        renderCart();
    }

    function removeItem(id) {
        cart = cart.filter(i => i.id !== id);
        persistCart();
        updateCartBadge();
        renderCart();
    }

    function renderCart() {
        const list = $("cart-items-list");
        list.innerHTML = "";

        if (cart.length === 0) {
            list.innerHTML =
                '<div class="empty-cart"><p>Your cart is empty.</p>' +
                '<button class="btn" id="empty-shop-btn">Browse products</button></div>';
            $("empty-shop-btn").addEventListener("click", () => showView("store"));
        } else {
            cart.forEach(item => {
                const p = PRODUCTS.find(x => x.id === item.id);
                if (!p) return;
                const row = document.createElement("div");
                row.className = "cart-item";
                row.innerHTML =
                    '<div class="item-details">' +
                        '<div class="item-icon">' + p.icon + "</div>" +
                        '<div class="item-info"><h3>' + p.name + "</h3><p>" + p.desc + "</p>" +
                        '<button class="remove-btn" data-action="remove" data-id="' + p.id + '">Remove</button></div>' +
                    "</div>" +
                    '<div class="item-actions">' +
                        '<div class="quantity-controls">' +
                            '<button class="qty-btn" data-action="dec" data-id="' + p.id + '" aria-label="Decrease quantity">-</button>' +
                            '<span class="qty-value">' + item.qty + "</span>" +
                            '<button class="qty-btn" data-action="inc" data-id="' + p.id + '" aria-label="Increase quantity">+</button>' +
                        "</div>" +
                        '<div class="item-price">' + money(p.price * item.qty) + "</div>" +
                    "</div>";
                list.appendChild(row);
            });
        }

        const subtotal = cart.reduce((sum, i) => {
            const p = PRODUCTS.find(x => x.id === i.id);
            return sum + (p ? p.price * i.qty : 0);
        }, 0);
        const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;

        $("summary-subtotal").textContent = money(subtotal);
        $("summary-shipping").textContent = shipping === 0 ? "Free" : money(shipping);
        $("summary-total").textContent = money(subtotal + shipping);
        $("checkout-btn").disabled = cart.length === 0;
    }

    // One delegated listener for all cart buttons
    $("cart-items-list").addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const id = Number(btn.dataset.id);
        if (btn.dataset.action === "inc") changeQty(id, 1);
        if (btn.dataset.action === "dec") changeQty(id, -1);
        if (btn.dataset.action === "remove") removeItem(id);
    });

    $("checkout-btn").addEventListener("click", () => {
        if (cart.length === 0) return;
        cart = [];
        persistCart();
        updateCartBadge();
        renderCart();
        toast("Order placed. Thank you, " + currentUser.name + "!");
    });

    // ---------- CONTACT FORM ----------
    $("contact-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("contact-name").value.trim();
        const email = $("contact-email").value.trim();
        const message = $("contact-message").value.trim();
        const error = $("contact-error");

        if (!name) { error.textContent = "Enter your name."; return; }
        if (!validEmail(email)) { error.textContent = "Enter a valid email address."; return; }
        if (message.length < 10) { error.textContent = "Write a message of at least 10 characters."; return; }

        // Demo only: connect this to a backend or a service like Formspree to really send it.
        error.textContent = "";
        $("contact-form").reset();
        toast("Message sent. We will reply within one business day.");
    });

    // ---------- INIT ----------
    renderFilters();
    renderProducts();
    updateCartBadge();
    setAuthMode("login");

    if (currentUser) {
        $("user-greeting").textContent = "Hi, " + currentUser.name;
        $("contact-name").value = currentUser.name;
        $("contact-email").value = currentUser.email;
        showView("store");
    } else {
        showView("login");
    }
});