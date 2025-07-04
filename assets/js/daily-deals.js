// Limpieza total: eliminamos el renderizado dinámico de Daily Deals para que solo el HTML controle la sección.

// Si quieres mantener la actualización automática de precios, deja solo la función updateDailyDealsPrices y la config de window.dailyDeals, pero elimina todo lo demás.

// Daily Deals Products (static for now, but price will update automatically)
window.dailyDeals = [
  {
    id: 'walkingpad',
    asin: 'B0C6VQ6Z8B',
    locale: 'ae',
    url: 'https://amzn.to/3I9uhuX',
    priceSelector: '#walkingpad-price',
  }
];

// Función para actualizar precios de Daily Deals
async function updateDailyDealsPrices() {
  for (const deal of window.dailyDeals) {
    try {
      const price = await getAmazonPrice(deal.asin, deal.locale); // Usa tu función de scraping existente
      if (price && document.querySelector(deal.priceSelector)) {
        document.querySelector(deal.priceSelector).textContent = price;
      }
    } catch (e) {
      // Si falla, no actualiza
    }
  }
}

// Llama a la función al cargar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateDailyDealsPrices);
} else {
  updateDailyDealsPrices();
} 