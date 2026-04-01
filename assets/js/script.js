/**
 * GadgetsUAE — Main Script (v4.0)
 * Handles: menu, search, favorites, footer, mobile nav
 */

// ===== MENU LOADER =====
document.addEventListener('DOMContentLoaded', () => {
    fetch('/menu.html')
        .then(r => r.ok ? r.text() : Promise.reject('Menu load failed'))
        .then(html => {
            const el = document.getElementById('menu-include');
            if (!el) return;
            el.innerHTML = html;
            setupMobileMenu();
            setupDropdowns();
            setupSearchToggle();
            highlightActiveLink();
        })
        .catch(e => console.error('Menu error:', e));

    // Footer
    const footer = document.getElementById('footer-include');
    if (footer) {
        fetch('/footer.html').then(r => r.text()).then(html => {
            footer.innerHTML = html;
            setupNewsletter();
        }).catch(() => {});
    }
});

// ===== ACTIVE LINK =====
function highlightActiveLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a, .nav-dropdown-menu a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (path === href || (path === '/' && href === '/')) {
            link.classList.add('active');
        }
    });
}

// ===== MOBILE MENU =====
function setupMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const overlay = document.getElementById('mobileOverlay');
    if (!toggle || !links) return;

    function closeMenu() {
        links.classList.remove('mobile-open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        overlay?.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    function openMenu() {
        links.classList.add('mobile-open');
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        overlay?.classList.add('active');
        document.body.classList.add('menu-open');
    }

    toggle.addEventListener('click', () => {
        links.classList.contains('mobile-open') ? closeMenu() : openMenu();
    });

    overlay?.addEventListener('click', closeMenu);

    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            if (window.innerWidth <= 900) closeMenu();
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && links.classList.contains('mobile-open')) closeMenu();
    });
}

// ===== DROPDOWNS =====
function setupDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach(dd => {
        const trigger = dd.querySelector('span');
        if (!trigger) return;

        trigger.addEventListener('click', e => {
            e.preventDefault();
            if (window.innerWidth <= 900) {
                dd.classList.toggle('open');
            }
        });
    });
}

// ===== SEARCH =====
function setupSearchToggle() {
    const btn = document.getElementById('searchToggle');
    const overlay = document.getElementById('searchOverlay');
    const closeBtn = document.getElementById('closeSearch');
    const overlayInput = document.getElementById('searchOverlayInput');
    const heroInput = document.querySelector('.hero-search input');

    if (!overlay) return;

    function openSearch(query) {
        overlay.classList.add('active');
        if (overlayInput) {
            overlayInput.value = query || '';
            setTimeout(() => overlayInput.focus(), 100);
        }
    }

    function closeSearch() {
        overlay.classList.remove('active');
    }

    btn?.addEventListener('click', () => openSearch());
    closeBtn?.addEventListener('click', closeSearch);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeSearch();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
    });

    // Hero search triggers overlay
    if (heroInput) {
        heroInput.addEventListener('focus', () => {
            openSearch(heroInput.value);
            heroInput.blur();
        });
    }

    // Search functionality in overlay
    if (overlayInput) {
        let timer;
        overlayInput.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => performSearch(overlayInput.value), 300);
        });

        overlayInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                clearTimeout(timer);
                performSearch(overlayInput.value);
            }
        });
    }
}

function performSearch(query) {
    const content = document.getElementById('searchResultsContent');
    const suggestions = document.getElementById('searchSuggestions');
    if (!content || !query || query.length < 2) {
        if (content) content.innerHTML = '';
        if (suggestions) suggestions.innerHTML = '';
        return;
    }

    const term = query.toLowerCase();
    const products = window.products || [];
    const matches = products.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );

    if (suggestions) suggestions.innerHTML = '';

    if (matches.length > 0 && window.renderer) {
        content.innerHTML = matches.slice(0, 12).map(p => window.renderer.createCard(p)).join('');
        window.renderer.initFavorites(content);
        window.renderer.initSwipe(content);
        updateFavoriteButtons();
    } else {
        content.innerHTML = `
            <div class="no-results">
                <h3>No products found</h3>
                <p style="color:var(--text-2)">Try searching for "gaming", "kindle", "audio" or "smart home"</p>
            </div>
        `;
    }
}

// ===== FAVORITES =====
window.getFavorites = function() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
};

window.setFavorites = function(favs) {
    localStorage.setItem('favorites', JSON.stringify(favs));
};

window.toggleFavorite = function(id) {
    let favs = getFavorites();
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    setFavorites(favs);
    updateFavoriteButtons();

    // Track analytics
    if (window.analyticsTracker) {
        const product = window.products?.find(p => p.id === id);
        if (product) {
            window.analyticsTracker.trackFavorite(id, product.title, favs.includes(id) ? 'add' : 'remove');
        }
    }
};

function updateFavoriteButtons() {
    const favs = getFavorites();
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const isFav = favs.includes(btn.dataset.id);
        btn.innerHTML = isFav ? '&#10084;' : '&#9825;';
        btn.classList.toggle('active', isFav);
    });
}

document.addEventListener('DOMContentLoaded', updateFavoriteButtons);

// ===== NEWSLETTER =====
function setupNewsletter() {
    const form = document.querySelector('.footer-newsletter');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        alert('Thank you for subscribing! We will keep you updated with the best deals.');
        form.reset();
    });
}

// ===== LAZY IMAGES =====
document.addEventListener('DOMContentLoaded', () => {
    const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    document.querySelectorAll('img[data-src]').forEach(img => obs.observe(img));
});
