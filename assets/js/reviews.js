// Placeholder for reviews UI and AggregateRating JSON-LD
(function(){
  function createReviewLd(productId, ratingValue, reviewCount){
    return {
      '@context':'https://schema.org',
      '@type':'Product',
      'sku': productId,
      'aggregateRating':{
        '@type':'AggregateRating',
        'ratingValue': String(ratingValue),
        'reviewCount': String(reviewCount)
      }
    };
  }

  window.addReviewLd = function(productId, ratingValue, reviewCount){
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(createReviewLd(productId, ratingValue, reviewCount));
    document.head.appendChild(s);
  };
})();
