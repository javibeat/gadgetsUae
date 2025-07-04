// Load the menu
document.addEventListener('DOMContentLoaded', function() {
    // Load the menu
    fetch('menu.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Insert the menu into the menu-include element
            const menuInclude = document.getElementById('menu-include');
            if (!menuInclude) {
                console.error('Element with ID "menu-include" not found');
                return;
            }
            menuInclude.innerHTML = html;
            // Initialize mobile menu
            setupMobileMenu();
        })
        .catch(error => console.error('Error loading menu:', error));
});

// Mobile menu setup
function setupMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    const body = document.body;
    
    if (!mobileMenu || !navList) {
        console.warn('Menu elements not found');
        return;
    }
    
    // Function to toggle the menu
    const toggleMenu = function() {
        const isOpen = navList.classList.toggle('active');
        mobileMenu.setAttribute('aria-expanded', isOpen);
        mobileMenu.classList.toggle('active');
        
        // Lock scroll when menu is open
        if (isOpen) {
            body.classList.add('menu-open');
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(function() {
                const firstLink = navList.querySelector('a');
                if (firstLink) firstLink.focus();
            });
        } else {
            body.classList.remove('menu-open');
            // Return focus to menu button
            mobileMenu.focus();
        }
    };
    
    // Click event on menu button
    mobileMenu.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMenu();
    });
    
    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 900) { // Only on mobile
                navList.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
            }
        });
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navList.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const target = e.target;
        const isClickInside = navList.contains(target);
        const isMenuButton = mobileMenu.contains(target);
        const isMenuOpen = navList.classList.contains('active');
        
        if (!isClickInside && !isMenuButton && isMenuOpen) {
            toggleMenu();
        }
    });
}

// Countdown timer functionality
function updateCountdown() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const timeLeft = endOfDay - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const countdownElement = document.getElementById('dealCountdown');
    if (countdownElement) {
        countdownElement.textContent = `Ends in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Update the countdown every second
setInterval(updateCountdown, 1000);

// Search functionality
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');

if (searchInput && searchButton) {
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // Search implementation will be added when API is ready
            console.log('Searching:', searchTerm);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
}

// Lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    lazyImages.forEach(img => imageObserver.observe(img));
});

// Newsletter functionality
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        // Newsletter registration will be implemented when backend is ready
        console.log('Newsletter signup:', email);
        alert('Thank you for subscribing! We will keep you updated with the best deals.');
        newsletterForm.reset();
    });
}

// Filter functionality (to be implemented later)
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            // Filtering will be implemented when API is ready
            console.log('Filtering by:', filter);
        });
    });
}

// Sorting functionality (to be implemented later)
function initializeSorting() {
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sortBy = sortSelect.value;
            // Sorting will be implemented when API is ready
            console.log('Sorting by:', sortBy);
        });
    }
}

// Initialize all functionalities
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    initializeSorting();
});

// Favorites logic
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function setFavorites(favs) {
  localStorage.setItem('favorites', JSON.stringify(favs));
}

function toggleFavorite(id) {
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  setFavorites(favs);
  updateFavoriteButtons();
}

function updateFavoriteButtons() {
  const favs = getFavorites();
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    if (favs.includes(btn.dataset.id)) {
      btn.innerHTML = '❤️';
      btn.classList.add('active');
    } else {
      btn.innerHTML = '\u2661';
      btn.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleFavorite(this.dataset.id);
    });
  });
  updateFavoriteButtons();
});

function includeHTML(selector, url, callback) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.querySelector(selector).innerHTML = html;
      if (callback) callback();
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Include footer
  if(document.getElementById('footer-include')) {
    includeHTML('#footer-include', 'footer.html');
  }
});

// ===== PRODUCT SUBMENU INTERACTION (FINAL DESKTOP+MOBILE) =====
document.addEventListener('DOMContentLoaded', function() {
  const submenu = document.querySelector('.product-submenu');
  if (!submenu) return;
  const categoryBtns = submenu.querySelectorAll('.category-btn');
  const categoriesList = submenu.querySelector('.categories-list');
  const toggleBtn = submenu.querySelector('.categories-toggle');
  const isMobile = () => window.innerWidth <= 900;

  function closeAllSubmenus() {
    categoryBtns.forEach(btn => {
      btn.classList.remove('active');
      const sub = btn.nextElementSibling;
      if (sub && sub.classList.contains('subcategory-list')) {
        sub.style.display = 'none';
      }
    });
  }

  // Toggle main menu on mobile
  if (toggleBtn && categoriesList) {
    toggleBtn.addEventListener('click', function() {
      const expanded = categoriesList.classList.toggle('mobile-active');
      toggleBtn.setAttribute('aria-expanded', expanded);
      if (!expanded) closeAllSubmenus();
    });
  }

  // Submenus: click to open/close
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isActive = btn.classList.contains('active');
      const sub = btn.nextElementSibling;
      
      if (isMobile()) {
        // On mobile: only one open at a time
        closeAllSubmenus();
        if (!isActive && sub && sub.classList.contains('subcategory-list')) {
          btn.classList.add('active');
          sub.style.display = 'block';
        }
      } else {
        // On desktop: toggle individually
        if (isActive) {
          btn.classList.remove('active');
          if (sub && sub.classList.contains('subcategory-list')) {
            sub.style.display = 'none';
          }
        } else {
          btn.classList.add('active');
          if (sub && sub.classList.contains('subcategory-list')) {
            sub.style.display = 'block';
          }
        }
      }
    });
  });

  // Close submenus when clicking outside
  document.addEventListener('click', function(e) {
    if (!submenu.contains(e.target)) {
      closeAllSubmenus();
      if (categoriesList && isMobile()) {
        categoriesList.classList.remove('mobile-active');
      }
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close submenus when switching to desktop
  window.addEventListener('resize', function() {
    closeAllSubmenus();
    if (categoriesList) categoriesList.classList.remove('mobile-active');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  });
});