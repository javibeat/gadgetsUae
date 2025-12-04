// Minimal blog JS helpers
// - Ensures external includes (menu/footer) load when DOM is ready
// - Optional: lazy upgrade for images

document.addEventListener('DOMContentLoaded', function(){
  // If you use a script to inject includes, ensure it runs after this script.
  // Placeholder for future client-side enhancements.
  const imgs = document.querySelectorAll('img[data-src]');
  imgs.forEach(img => {
    img.setAttribute('src', img.dataset.src);
    img.removeAttribute('data-src');
  });
});
