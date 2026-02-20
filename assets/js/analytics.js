// Analytics System for GadgetsUAE
// Tracks user behavior, searches, product clicks, and more
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCup55Bnb1t5MopmPRjJJU_X34CkIVha-U",
    authDomain: "gadgetsdxb-8a23f.firebaseapp.com",
    projectId: "gadgetsdxb-8a23f",
    storageBucket: "gadgetsdxb-8a23f.firebasestorage.app",
    messagingSenderId: "188473253964",
    appId: "1:188473253964:web:03a200c8da00179dd0d4e9",
    measurementId: "G-313VE0B714"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class AnalyticsTracker {
    constructor() {
        this.storageKey = 'gadgetsUAE_analytics';
        this.adminKey = 'gadgetsUAE_is_admin';
        this.visitorIdKey = 'gadgetsUAE_visitor_id';
        this.sessionKey = 'gadgetsUAE_session';
        this.maxEvents = 1000; // Maximum events to store locally
        this.flushInterval = 5 * 60 * 1000; // Flush to server every 5 minutes
        this.visitorInfo = this.getStoredVisitorInfo();
        this.visitorId = this.getOrCreateVisitorId();
        this.sessionId = this.getOrCreateSession();
        this.init();
    }

    // Generate or retrieve unique visitor ID
    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem(this.visitorIdKey);
        if (!visitorId) {
            visitorId = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem(this.visitorIdKey, visitorId);
        }
        return visitorId;
    }

    // Track session (new session after 30 min inactivity)
    getOrCreateSession() {
        const stored = sessionStorage.getItem(this.sessionKey);
        if (stored) {
            const session = JSON.parse(stored);
            const now = Date.now();
            // If last activity was more than 30 min ago, new session
            if (now - session.lastActivity > 30 * 60 * 1000) {
                return this.createNewSession();
            }
            session.lastActivity = now;
            sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
            return session;
        }
        return this.createNewSession();
    }

    createNewSession() {
        const session = {
            id: 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
            startTime: Date.now(),
            lastActivity: Date.now(),
            pageCount: 0
        };
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
        return session;
    }

    updateSession() {
        this.sessionId.lastActivity = Date.now();
        this.sessionId.pageCount++;
        sessionStorage.setItem(this.sessionKey, JSON.stringify(this.sessionId));
    }

    init() {
        // Load existing events
        this.events = this.loadEvents();

        // Check if user is admin (site owner)
        this.isAdmin = localStorage.getItem(this.adminKey) === 'true';

        // Fetch visitor info (IP, Location, Emirate)
        this.fetchVisitorInfo();

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

    // Capture visitor location and IP safely
    async fetchVisitorInfo() {
        if (this.visitorInfo) return;

        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            this.visitorInfo = {
                ip: data.ip,
                emirate: data.region,
                city: data.city,
                country: data.country_name,
                source: this.getTrafficSource(),
                userAgent: navigator.userAgent
            };
            sessionStorage.setItem('gadgetsUAE_visitor_info', JSON.stringify(this.visitorInfo));
        } catch (e) {
            // Service might be blocked or down, fallback to referrer only
            this.visitorInfo = { source: this.getTrafficSource() };
        }
    }

    getStoredVisitorInfo() {
        const stored = sessionStorage.getItem('gadgetsUAE_visitor_info');
        return stored ? JSON.parse(stored) : null;
    }

    getTrafficSource() {
        const referrer = document.referrer;
        if (!referrer) return 'Direct';

        try {
            const url = new URL(referrer);
            const host = url.hostname.toLowerCase();
            if (host.includes('google')) return 'Google';
            if (host.includes('facebook') || host.includes('t.co') || host.includes('instagram')) return 'Social';
            if (host.includes('bing') || host.includes('yahoo')) return 'Search Engine';
            if (host.includes('gadgetsdxb.com')) return 'Internal';
            return host;
        } catch (e) {
            return 'Direct';
        }
    }

    // Detect device type
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'Tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    // Track page view
    trackPageView() {
        // Skip tracking for the analytics dashboard itself
        const currentPath = window.location.pathname;
        if (currentPath.includes('analytics-dashboard')) {
            return;
        }

        // Update session
        this.updateSession();

        const pageData = {
            type: 'pageview',
            url: window.location.href,
            path: currentPath,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            visitorId: this.visitorId,
            sessionId: this.sessionId.id,
            sessionPageCount: this.sessionId.pageCount,
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language,
            deviceType: this.getDeviceType(),
            hour: new Date().getHours()
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
        // Mark as admin if owner is browsing
        if (this.isAdmin) {
            event.isAdmin = true;
        }

        // Enrich event with visitor info if available
        if (this.visitorInfo) {
            event.visitor = this.visitorInfo;
        }

        this.events.push(event);

        // Sync to Firebase (Background)
        this.syncToFirebase(event);

        // Limit events to prevent storage issues
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        // Save to localStorage
        this.saveEvents();
    }

    async syncToFirebase(event) {
        try {
            // Clean up event for Firebase (avoid circular refs if any)
            const dbEvent = { ...event, serverTime: serverTimestamp() };
            await addDoc(collection(db, "gadgetsUAE_events"), dbEvent);
        } catch (e) {
            console.warn('Firebase Sync Error:', e);
        }
    }

    // Load events from Firebase for the dashboard
    async loadGlobalEvents() {
        try {
            const q = query(collection(db, "gadgetsUAE_events"), orderBy("timestamp", "desc"), limit(1000));
            const querySnapshot = await getDocs(q);
            const globalEvents = [];
            querySnapshot.forEach((doc) => {
                globalEvents.push(doc.data());
            });
            return globalEvents;
        } catch (e) {
            console.error('Error loading global events:', e);
            return this.events; // Fallback to local
        }
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
        const pageviews = allEvents.filter(e => e.type === 'pageview');

        // Calculate unique visitors and sessions
        const uniqueVisitors = new Set(pageviews.map(e => e.visitorId || e.visitor?.ip).filter(Boolean)).size;
        const uniqueSessions = new Set(pageviews.map(e => e.sessionId).filter(Boolean)).size;

        // Calculate bounce rate (sessions with only 1 page view)
        const sessionPageCounts = {};
        pageviews.forEach(e => {
            if (e.sessionId) {
                sessionPageCounts[e.sessionId] = (sessionPageCounts[e.sessionId] || 0) + 1;
            }
        });
        const totalSessions = Object.keys(sessionPageCounts).length;
        const bouncedSessions = Object.values(sessionPageCounts).filter(count => count === 1).length;
        const bounceRate = totalSessions > 0 ? ((bouncedSessions / totalSessions) * 100).toFixed(1) : 0;
        const avgPagesPerSession = totalSessions > 0 ? (pageviews.length / totalSessions).toFixed(1) : 0;

        return {
            totalEvents: allEvents.length,
            pageViews: pageviews.length,
            uniqueVisitors: uniqueVisitors,
            uniqueSessions: uniqueSessions,
            bounceRate: bounceRate,
            avgPagesPerSession: avgPagesPerSession,
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
            locations: this.getTopLocations(allEvents),
            countries: this.getTopCountries(allEvents),
            sources: this.getTopSources(allEvents),
            referrers: this.getTopReferrers(allEvents),
            pages: this.getTopPages(allEvents),
            timeline: this.getTimeline(allEvents),
            conversionRate: this.getConversionRate(allEvents),
            devices: this.getDeviceBreakdown(allEvents),
            activityHours: this.getActivityByHour(allEvents),
            weekComparison: this.getWeekComparison(allEvents)
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

    // Get top locations (Emirates)
    getTopLocations(events) {
        const locations = {};
        events.forEach(e => {
            if (e.visitor && e.visitor.emirate) {
                const loc = e.visitor.emirate;
                locations[loc] = (locations[loc] || 0) + 1;
            }
        });
        return Object.entries(locations)
            .sort((a, b) => b[1] - a[1])
            .map(([emirate, count]) => ({ emirate, count }));
    }

    // Get top countries
    getTopCountries(events) {
        const countries = {};
        events.forEach(e => {
            if (e.visitor && e.visitor.country) {
                const country = e.visitor.country;
                countries[country] = (countries[country] || 0) + 1;
            }
        });
        return Object.entries(countries)
            .sort((a, b) => b[1] - a[1])
            .map(([country, count]) => ({ country, count }));
    }

    // Get top traffic sources
    getTopSources(events) {
        const sources = {};
        events.forEach(e => {
            if (e.visitor && e.visitor.source) {
                const src = e.visitor.source;
                sources[src] = (sources[src] || 0) + 1;
            }
        });
        return Object.entries(sources)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => ({ source, count }));
    }

    // Calculate conversion rate (clicks to Amazon / pageviews)
    getConversionRate(events) {
        const pageviews = events.filter(e => e.type === 'pageview').length;
        const clicks = events.filter(e => e.type === 'product_click').length;
        const rate = pageviews > 0 ? ((clicks / pageviews) * 100).toFixed(2) : 0;
        return {
            rate: rate,
            pageviews: pageviews,
            clicks: clicks
        };
    }

    // Get device breakdown
    getDeviceBreakdown(events) {
        const devices = {};
        events.filter(e => e.type === 'pageview').forEach(e => {
            const device = e.deviceType || 'Unknown';
            devices[device] = (devices[device] || 0) + 1;
        });
        return Object.entries(devices)
            .sort((a, b) => b[1] - a[1])
            .map(([device, count]) => ({ device, count }));
    }

    // Get activity by hour
    getActivityByHour(events) {
        const hours = Array(24).fill(0);
        events.filter(e => e.type === 'pageview').forEach(e => {
            const hour = e.hour !== undefined ? e.hour : new Date(e.timestamp).getHours();
            hours[hour]++;
        });
        return hours.map((count, hour) => ({ hour, count }));
    }

    // Get week-over-week comparison
    getWeekComparison(events) {
        const now = new Date();
        const thisWeekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const lastWeekStart = new Date(now - 14 * 24 * 60 * 60 * 1000);

        const thisWeek = events.filter(e => new Date(e.timestamp) > thisWeekStart);
        const lastWeek = events.filter(e => {
            const d = new Date(e.timestamp);
            return d > lastWeekStart && d <= thisWeekStart;
        });

        const calc = (week) => ({
            pageviews: week.filter(e => e.type === 'pageview').length,
            searches: week.filter(e => e.type === 'search').length,
            clicks: week.filter(e => e.type === 'product_click').length,
            uniqueVisitors: new Set(week.filter(e => e.type === 'pageview').map(e => e.visitorId)).size
        });

        const thisWeekData = calc(thisWeek);
        const lastWeekData = calc(lastWeek);

        const change = (metric) => {
            if (lastWeekData[metric] === 0) return thisWeekData[metric] > 0 ? 100 : 0;
            return (((thisWeekData[metric] - lastWeekData[metric]) / lastWeekData[metric]) * 100).toFixed(1);
        };

        return {
            thisWeek: thisWeekData,
            lastWeek: lastWeekData,
            change: {
                pageviews: change('pageviews'),
                searches: change('searches'),
                clicks: change('clicks'),
                uniqueVisitors: change('uniqueVisitors')
            }
        };
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

    // Export raw events with visitor info as CSV
    exportRawEventsCSV() {
        let csv = 'Timestamp,Type,Path/Info,UserType,Location,Source,IP\n';
        this.events.slice().reverse().forEach(e => {
            const time = new Date(e.timestamp).toISOString();
            const info = e.type === 'pageview' ? e.path : (e.productTitle || e.query || '');
            const userType = e.isAdmin ? 'Admin' : 'Visitor';
            const loc = e.visitor ? `${e.visitor.emirate || ''} ${e.visitor.city || ''}`.trim() : 'Unknown';
            const src = e.visitor?.source || 'Direct';
            const ip = e.visitor?.ip || 'Anonymous';

            csv += `"${time}","${e.type}","${info.replace(/"/g, '""')}","${userType}","${loc}","${src}","${ip}"\n`;
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





