// Analytics System for GadgetsUAE
// Tracks user behavior, searches, product clicks, and more

class AnalyticsTracker {
    constructor() {
        this.storageKey = 'gadgetsUAE_analytics';
        this.maxEvents = 1000; // Maximum events to store locally
        this.flushInterval = 5 * 60 * 1000; // Flush to server every 5 minutes
        this.init();
    }

    init() {
        // Load existing events
        this.events = this.loadEvents();
        
        // Track page view
        this.trackPageView();
        
        // Track search functionality
        this.trackSearches();
        
        // Track product interactions
        this.trackProductClicks();
        
        // Track favorites
        this.trackFavorites();
        
        // Auto-flush to prevent memory issues
        setInterval(() => this.flushEvents(), this.flushInterval);
        
        // Flush on page unload
        window.addEventListener('beforeunload', () => this.flushEvents());
    }

    // Track page view
    trackPageView() {
        const pageData = {
            type: 'pageview',
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language
        };
        
        this.addEvent(pageData);
        
        // Extract search terms from referrer
        if (document.referrer) {
            const searchTerms = this.extractSearchTerms(document.referrer);
            if (searchTerms) {
                this.trackSearch('referrer', searchTerms);
            }
        }
    }

    // Extract search terms from referrer URLs
    extractSearchTerms(referrer) {
        try {
            const url = new URL(referrer);
            const hostname = url.hostname.toLowerCase();
            
            // Google search
            if (hostname.includes('google')) {
                return url.searchParams.get('q');
            }
            // Bing search
            if (hostname.includes('bing')) {
                return url.searchParams.get('q');
            }
            // Yahoo search
            if (hostname.includes('yahoo')) {
                return url.searchParams.get('p');
            }
            // DuckDuckGo
            if (hostname.includes('duckduckgo')) {
                return url.searchParams.get('q');
            }
        } catch (e) {
            console.log('Error extracting search terms:', e);
        }
        return null;
    }

    // Track search functionality
    trackSearches() {
        const searchInput = document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-button');
        
        if (searchInput) {
            // Track search submissions
            if (searchButton) {
                searchButton.addEventListener('click', () => {
                    const query = searchInput.value.trim();
                    if (query) {
                        this.trackSearch('internal', query);
                    }
                });
            }
            
            // Track search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        this.trackSearch('internal', query);
                    }
                }
            });
        }
    }

    // Track search event
    trackSearch(source, query) {
        const searchData = {
            type: 'search',
            source: source, // 'internal' or 'referrer'
            query: query.toLowerCase(),
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this.addEvent(searchData);
    }

    // Track product clicks
    trackProductClicks() {
        // Track clicks on product cards
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productLink = productCard.querySelector('a[href*="amzn.to"]');
                if (productLink) {
                    const productId = productCard.querySelector('.favorite-btn')?.dataset.id;
                    const productTitle = productCard.querySelector('h3')?.textContent.trim();
                    const productPrice = productCard.querySelector('.current-price')?.textContent.trim();
                    
                    this.trackProductClick({
                        productId: productId || 'unknown',
                        productTitle: productTitle || 'unknown',
                        productPrice: productPrice || 'unknown',
                        url: productLink.href
                    });
                }
            }
            
            // Track "View on Amazon" buttons
            if (e.target.classList.contains('product-cta') || e.target.closest('.product-cta')) {
                const link = e.target.href || e.target.closest('.product-cta')?.href;
                const productCard = e.target.closest('.product-card');
                if (productCard && link) {
                    const productId = productCard.querySelector('.favorite-btn')?.dataset.id;
                    const productTitle = productCard.querySelector('h3')?.textContent.trim();
                    
                    this.trackProductClick({
                        productId: productId || 'unknown',
                        productTitle: productTitle || 'unknown',
                        productPrice: productCard.querySelector('.current-price')?.textContent.trim() || 'unknown',
                        url: link,
                        action: 'view_on_amazon'
                    });
                }
            }
        });
    }

    // Track product click event
    trackProductClick(data) {
        const clickData = {
            type: 'product_click',
            productId: data.productId,
            productTitle: data.productTitle,
            productPrice: data.productPrice,
            url: data.url,
            action: data.action || 'click',
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        };
        
        this.addEvent(clickData);
    }

    // Track favorites
    trackFavorites() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn') || e.target.closest('.favorite-btn')) {
                const btn = e.target.classList.contains('favorite-btn') ? e.target : e.target.closest('.favorite-btn');
                const productId = btn.dataset.id;
                const productCard = btn.closest('.product-card');
                const productTitle = productCard?.querySelector('h3')?.textContent.trim();
                
                // Check if it's being added or removed
                const isFavorite = btn.textContent.includes('♥') || btn.classList.contains('favorited');
                
                this.trackFavorite({
                    productId: productId || 'unknown',
                    productTitle: productTitle || 'unknown',
                    action: isFavorite ? 'remove' : 'add'
                });
            }
        });
    }

    // Track favorite event
    trackFavorite(data) {
        const favoriteData = {
            type: 'favorite',
            productId: data.productId,
            productTitle: data.productTitle,
            action: data.action,
            timestamp: new Date().toISOString()
        };
        
        this.addEvent(favoriteData);
    }

    // Add event to storage
    addEvent(event) {
        this.events.push(event);
        
        // Limit events to prevent storage issues
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
        
        // Save to localStorage
        this.saveEvents();
    }

    // Load events from localStorage
    loadEvents() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading analytics events:', e);
            return [];
        }
    }

    // Save events to localStorage
    saveEvents() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.events));
        } catch (e) {
            console.error('Error saving analytics events:', e);
            // If storage is full, try to clear old events
            if (e.name === 'QuotaExceededError') {
                this.events = this.events.slice(-500); // Keep only last 500
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(this.events));
                } catch (e2) {
                    console.error('Could not save analytics after cleanup:', e2);
                }
            }
        }
    }

    // Flush events (could send to server in the future)
    flushEvents() {
        // For now, just ensure events are saved
        this.saveEvents();
        
        // In the future, you could send to a server endpoint:
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     body: JSON.stringify(this.events)
        // });
    }

    // Get analytics data (for dashboard)
    getAnalytics() {
        const now = new Date();
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const allEvents = this.events;
        
        return {
            totalEvents: allEvents.length,
            pageViews: allEvents.filter(e => e.type === 'pageview').length,
            searches: {
                total: allEvents.filter(e => e.type === 'search').length,
                internal: allEvents.filter(e => e.type === 'search' && e.source === 'internal').length,
                referrer: allEvents.filter(e => e.type === 'search' && e.source === 'referrer').length,
                topQueries: this.getTopSearches(allEvents),
                last24h: allEvents.filter(e => e.type === 'search' && new Date(e.timestamp) > last24h).length,
                last7d: allEvents.filter(e => e.type === 'search' && new Date(e.timestamp) > last7d).length,
                last30d: allEvents.filter(e => e.type === 'search' && new Date(e.timestamp) > last30d).length
            },
            productClicks: {
                total: allEvents.filter(e => e.type === 'product_click').length,
                topProducts: this.getTopProducts(allEvents),
                last24h: allEvents.filter(e => e.type === 'product_click' && new Date(e.timestamp) > last24h).length,
                last7d: allEvents.filter(e => e.type === 'product_click' && new Date(e.timestamp) > last7d).length,
                last30d: allEvents.filter(e => e.type === 'product_click' && new Date(e.timestamp) > last30d).length
            },
            favorites: {
                total: allEvents.filter(e => e.type === 'favorite').length,
                adds: allEvents.filter(e => e.type === 'favorite' && e.action === 'add').length,
                removes: allEvents.filter(e => e.type === 'favorite' && e.action === 'remove').length
            },
            referrers: this.getTopReferrers(allEvents),
            pages: this.getTopPages(allEvents),
            timeline: this.getTimeline(allEvents)
        };
    }

    // Get top search queries
    getTopSearches(events) {
        const searches = events.filter(e => e.type === 'search' && e.query);
        const queryCounts = {};
        
        searches.forEach(e => {
            queryCounts[e.query] = (queryCounts[e.query] || 0) + 1;
        });
        
        return Object.entries(queryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([query, count]) => ({ query, count }));
    }

    // Get top products
    getTopProducts(events) {
        const clicks = events.filter(e => e.type === 'product_click');
        const productCounts = {};
        
        clicks.forEach(e => {
            const key = e.productId || e.productTitle;
            if (!productCounts[key]) {
                productCounts[key] = {
                    id: e.productId,
                    title: e.productTitle,
                    count: 0
                };
            }
            productCounts[key].count++;
        });
        
        return Object.values(productCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);
    }

    // Get top referrers
    getTopReferrers(events) {
        const pageviews = events.filter(e => e.type === 'pageview' && e.referrer);
        const referrerCounts = {};
        
        pageviews.forEach(e => {
            try {
                const url = new URL(e.referrer);
                const hostname = url.hostname;
                referrerCounts[hostname] = (referrerCounts[hostname] || 0) + 1;
            } catch (err) {
                // Skip invalid URLs
            }
        });
        
        return Object.entries(referrerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([domain, count]) => ({ domain, count }));
    }

    // Get top pages
    getTopPages(events) {
        const pageviews = events.filter(e => e.type === 'pageview');
        const pageCounts = {};
        
        pageviews.forEach(e => {
            const path = e.path || '/';
            pageCounts[path] = (pageCounts[path] || 0) + 1;
        });
        
        return Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([path, count]) => ({ path, count }));
    }

    // Get timeline data
    getTimeline(events) {
        const timeline = {};
        
        events.forEach(e => {
            const date = new Date(e.timestamp).toISOString().split('T')[0];
            if (!timeline[date]) {
                timeline[date] = {
                    pageviews: 0,
                    searches: 0,
                    productClicks: 0,
                    favorites: 0
                };
            }
            
            if (e.type === 'pageview') timeline[date].pageviews++;
            if (e.type === 'search') timeline[date].searches++;
            if (e.type === 'product_click') timeline[date].productClicks++;
            if (e.type === 'favorite') timeline[date].favorites++;
        });
        
        return Object.entries(timeline)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, data]) => ({ date, ...data }));
    }

    // Clear all analytics data
    clearAnalytics() {
        this.events = [];
        localStorage.removeItem(this.storageKey);
    }

    // Export analytics as JSON
    exportJSON() {
        return JSON.stringify(this.getAnalytics(), null, 2);
    }

    // Export analytics as CSV
    exportCSV() {
        const analytics = this.getAnalytics();
        let csv = 'Metric,Value\n';
        
        csv += `Total Events,${analytics.totalEvents}\n`;
        csv += `Page Views,${analytics.pageViews}\n`;
        csv += `Total Searches,${analytics.searches.total}\n`;
        csv += `Internal Searches,${analytics.searches.internal}\n`;
        csv += `Referrer Searches,${analytics.searches.referrer}\n`;
        csv += `Product Clicks,${analytics.productClicks.total}\n`;
        csv += `Favorites Added,${analytics.favorites.adds}\n`;
        csv += `Favorites Removed,${analytics.favorites.removes}\n\n`;
        
        csv += 'Top Search Queries,Count\n';
        analytics.searches.topQueries.forEach(q => {
            csv += `"${q.query}",${q.count}\n`;
        });
        
        csv += '\nTop Products,Count\n';
        analytics.productClicks.topProducts.forEach(p => {
            csv += `"${p.title}",${p.count}\n`;
        });
        
        csv += '\nTop Referrers,Count\n';
        analytics.referrers.forEach(r => {
            csv += `"${r.domain}",${r.count}\n`;
        });
        
        return csv;
    }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.analytics = new AnalyticsTracker();
    });
} else {
    window.analytics = new AnalyticsTracker();
}

