// Inject JSON-LD Product / ItemList and BreadcrumbList from prices.json and window.products
(function(){
  function isoDatePlusDays(days){
    const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0];
  }

  function createScript(json){
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(json);
    document.head.appendChild(s);
  }

  function buildProductLd(product, priceData){
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.title,
      'image': product.gallery && product.gallery.length ? product.gallery.map(p=>location.origin + '/' + p.replace(/^\//,'').replace(/^assets\//,'assets/')) : [location.origin + '/' + product.image.replace(/^\//,'')],
      'description': product.description || product.title,
      'sku': product.id,
      'brand': {
        '@type': 'Brand',
        'name': (product.title.split(' ')[0]) || ''
      },
      'offers': {
        '@type': 'Offer',
        'url': product.url,
        'priceCurrency': 'AED',
        'price': priceData && priceData.current ? priceData.current : product.price.replace(/[^0-9.]/g,''),
        'priceValidUntil': isoDatePlusDays(60),
        'availability': 'https://schema.org/InStock'
      }
    };
  }

  function buildItemList(products, prices){
    const itemList = { '@context':'https://schema.org','@type':'ItemList','itemListElement': [] };
    products.forEach((p, i)=>{
      const price = prices[p.id] || null;
      itemList.itemListElement.push({
        '@type':'ListItem',
        'position': i+1,
        'item': {
          '@type':'Product',
          'name': p.title,
          'image': location.origin + '/' + p.image.replace(/^\//,''),
          'offers': {
            '@type':'Offer',
            'priceCurrency':'AED',
            'price': price ? price.current : p.price.replace(/[^0-9.]/g,''),
            'priceValidUntil': isoDatePlusDays(60),
            'availability':'https://schema.org/InStock',
            'url': p.url
          }
        }
      });
    });
    return itemList;
  }

  function buildBreadcrumb(pathSegments){
    const list = { '@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[] };
    pathSegments.forEach((seg,i)=>{
      list.itemListElement.push({
        '@type':'ListItem',
        'position': i+1,
        'name': seg.name,
        'item': seg.url
      });
    });
    return list;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    if (!window.products) return;
    fetch('/assets/data/prices.json').then(r=>r.json()).then(prices=>{
      try{
        // Inject ItemList for home / index
        const itemList = buildItemList(window.products.slice(0,10), prices);
        createScript(itemList);

        // If this is a product post, inject Product JSON-LD and BreadcrumbList
        const postBody = document.querySelector('body.post');
        if (postBody && postBody.dataset && postBody.dataset.productId){
          const pid = postBody.dataset.productId;
          const prod = window.products.find(p=>p.id===pid);
          const priceData = prices[pid] || null;
          if (prod){
            const prodLd = buildProductLd(prod, priceData);
            createScript(prodLd);
            const bc = buildBreadcrumb([
              { name: 'Home', url: location.origin + '/' },
              { name: prod.title, url: location.href }
            ]);
            createScript(bc);
          }
        }
      }catch(e){console.error('JSON-LD injector error',e)}
    }).catch(err=>console.warn('Failed to load prices.json for JSON-LD',err));
  });
})();
