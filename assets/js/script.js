// Load the menu
document.addEventListener('DOMContentLoaded', function() {
    // Load the menu (use absolute path to work from any page path)
    fetch('/menu.html')
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
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const searchResultsContent = document.getElementById('searchResultsContent');
    const searchResultsTitle = document.getElementById('searchResultsTitle');

    // Crear contenedor de sugerencias en tiempo real
    const searchSuggestionsContainer = document.createElement('div');
    searchSuggestionsContainer.className = 'search-suggestions-container';
    searchSuggestionsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 0 0 15px 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        display: none;
        max-height: 300px;
        overflow-y: auto;
    `;
    
    // Añadir el contenedor después del input
    if (searchInput && searchInput.parentElement) {
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(searchSuggestionsContainer);
    }

    // Lista de productos para sugerencias
    const productos = [
        { titulo: 'KingSmith WalkingPad A1 Pro', categoria: 'Fitness / Treadmills', terminos: ['walkingpad', 'treadmill', 'fitness', 'ejercicio'] },
        { titulo: 'roborock S7 Max Ultra', categoria: 'Home / Robotic Vacuums', terminos: ['roborock', 'robot', 'aspiradora', 'limpieza'] },
        { titulo: 'Wemart Self Cleaning Cat Litter Box', categoria: 'Pet Supplies', terminos: ['wemart', 'gato', 'mascota', 'litter'] },
        { titulo: 'Nintendo Switch 2 Console', categoria: 'Video Games', terminos: ['nintendo', 'switch', 'consola', 'video games'] },
        { titulo: 'Nintendo Switch 2 Pro Controller', categoria: 'Video Games / Accessories', terminos: ['nintendo', 'controller', 'mando', 'accesorio'] },
        { titulo: 'SanDisk microSD Express 256GB', categoria: 'Video Games / Storage', terminos: ['sandisk', 'microsd', 'almacenamiento', 'storage'] }
    ];

    let debounceTimer;

    function mostrarSugerenciasEnTiempoReal(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            searchSuggestionsContainer.style.display = 'none';
            return;
        }

        const termino = searchTerm.toLowerCase();
        const sugerencias = productos.filter(producto => 
            producto.titulo.toLowerCase().includes(termino) ||
            producto.categoria.toLowerCase().includes(termino) ||
            producto.terminos.some(term => term.toLowerCase().includes(termino))
        ).slice(0, 5); // Máximo 5 sugerencias

        if (sugerencias.length > 0) {
            searchSuggestionsContainer.innerHTML = sugerencias.map(producto => `
                <div class="search-suggestion-item" onclick="seleccionarSugerencia('${producto.titulo}')">
                    <div class="suggestion-content">
                        <div class="suggestion-title">${producto.titulo}</div>
                        <div class="suggestion-category">${producto.categoria}</div>
                    </div>
                </div>
            `).join('');
            
            searchSuggestionsContainer.style.display = 'block';
        } else {
            searchSuggestionsContainer.style.display = 'none';
        }
    }

    // Función para seleccionar sugerencia
    window.seleccionarSugerencia = function(titulo) {
        searchInput.value = titulo;
        searchSuggestionsContainer.style.display = 'none';
        mostrarResultadosBusqueda();
    };

    // Event listener para sugerencias en tiempo real
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                mostrarSugerenciasEnTiempoReal(e.target.value);
            }, 300); // Debounce de 300ms
        });

        // Ocultar sugerencias al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchInput.parentElement.contains(e.target)) {
                searchSuggestionsContainer.style.display = 'none';
            }
        });

        // Navegación con teclado en sugerencias
        searchInput.addEventListener('keydown', (e) => {
            const sugerencias = searchSuggestionsContainer.querySelectorAll('.search-suggestion-item');
            const sugerenciaActiva = searchSuggestionsContainer.querySelector('.search-suggestion-item.active');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (sugerencias.length > 0) {
                    if (!sugerenciaActiva) {
                        sugerencias[0].classList.add('active');
                    } else {
                        sugerenciaActiva.classList.remove('active');
                        const siguiente = sugerenciaActiva.nextElementSibling;
                        if (siguiente) {
                            siguiente.classList.add('active');
                        } else {
                            sugerencias[0].classList.add('active');
                        }
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (sugerenciaActiva) {
                    sugerenciaActiva.classList.remove('active');
                    const anterior = sugerenciaActiva.previousElementSibling;
                    if (anterior) {
                        anterior.classList.add('active');
                    } else {
                        sugerencias[sugerencias.length - 1].classList.add('active');
                    }
                }
            } else if (e.key === 'Enter') {
                if (sugerenciaActiva) {
                    e.preventDefault();
                    const titulo = sugerenciaActiva.querySelector('.suggestion-title').textContent;
                    seleccionarSugerencia(titulo);
                } else {
                    mostrarResultadosBusqueda();
                }
            }
        });
    }

    if (searchInput && searchButton) {
        function mostrarResultadosBusqueda() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            
            if (!searchTerm) {
                return; // No hacer nada si el campo está vacío
            }

            // Ocultar sugerencias en tiempo real
            searchSuggestionsContainer.style.display = 'none';

            // Mostrar overlay con loading
            searchOverlay.classList.add('active');
            searchResultsContent.innerHTML = `
                <div class="search-loading">
                    <div class="spinner"></div>
                    <p>Buscando productos...</p>
                </div>
            `;

            // Simular delay para mejor UX
            setTimeout(() => {
                const productCards = document.querySelectorAll('.product-card');
                const resultados = [];

                productCards.forEach(card => {
                    const title = card.querySelector('.product-info h3');
                    const category = card.querySelector('.product-category');
                    const titleText = title ? title.textContent.toLowerCase() : '';
                    const categoryText = category ? category.textContent.toLowerCase() : '';
                    
                    if (titleText.includes(searchTerm) || categoryText.includes(searchTerm)) {
                        // Clonar la tarjeta para el overlay
                        const cardClone = card.cloneNode(true);
                        resultados.push(cardClone);
                    }
                });

                // Actualizar título con número de resultados
                searchResultsTitle.textContent = `Resultados de búsqueda (${resultados.length})`;

                if (resultados.length > 0) {
                    // Mostrar resultados
                    searchResultsContent.innerHTML = `
                        <div class="search-results-grid">
                            ${resultados.map(card => card.outerHTML).join('')}
                        </div>
                    `;
                    
                    // Reinicializar funcionalidades en las tarjetas clonadas
                    const clonedCards = searchResultsContent.querySelectorAll('.product-card');
                    clonedCards.forEach(card => {
                        // Reinicializar botones de favoritos
                        const favBtn = card.querySelector('.favorite-btn');
                        if (favBtn) {
                            favBtn.addEventListener('click', function(e) {
                                e.stopPropagation();
                                toggleFavorite(this.dataset.id);
                            });
                        }
                        
                        // Reinicializar galerías de imágenes
                        const gallery = card.querySelector('.gallery-thumbnails');
                        if (gallery) {
                            const thumbs = gallery.querySelectorAll('.thumb');
                            thumbs.forEach(thumb => {
                                thumb.addEventListener('click', function() {
                                    const mainImg = card.querySelector('.main-image');
                                    if (mainImg && this.src) {
                                        mainImg.src = this.src;
                                    }
                                    setSelectedThumb(this);
                                });
                            });
                        }
                    });
                    
                    // Actualizar botones de favoritos
                    updateFavoriteButtons();
                } else {
                    // Mostrar mensaje de no resultados
                    const sugerencias = ['nintendo', 'walkingpad', 'roborock', 'wemart', 'fitness', 'video games'];
                    const sugerenciasFiltradas = sugerencias.filter(s => s.includes(searchTerm) || searchTerm.includes(s));
                    
                    searchResultsContent.innerHTML = `
                        <div class="search-no-results">
                            <h3>No se encontraron productos</h3>
                            <p>No hay productos que coincidan con "${searchInput.value.trim()}"</p>
                            ${sugerenciasFiltradas.length > 0 ? `
                                <div class="search-suggestions">
                                    <p>Prueba con:</p>
                                    ${sugerenciasFiltradas.map(s => `
                                        <a href="#" class="search-suggestion" onclick="buscarSugerencia('${s}')">${s}</a>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }
            }, 500); // Delay de 500ms para mejor UX
        }

        // Función para buscar sugerencias
        window.buscarSugerencia = function(termino) {
            searchInput.value = termino;
            mostrarResultadosBusqueda();
        };

        searchButton.addEventListener('click', mostrarResultadosBusqueda);
    }

    // Cerrar overlay
    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }

    // Cerrar overlay al hacer clic fuera
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    // Cerrar overlay con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
        }
    });
});

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
        includeHTML('#footer-include', '/footer.html');
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