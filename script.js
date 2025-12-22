/**
 * Denver Sam - Colorado Local Guide
 * Main JavaScript file
 * Handles weather, news feeds, Instagram embeds, and mobile menu
 */

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initWeatherWidget();
    initNewsFeed();
    initInstagramEmbeds();
    initSmoothScrolling();
});

/**
 * Mobile Menu Handler
 */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu nav a');

    if (!mobileMenuToggle || !mobileMenu || !mobileMenuClose) return;

    mobileMenuToggle.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        mobileMenuClose.focus();
    });

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        mobileMenuToggle.focus();
    }

    mobileMenuClose.addEventListener('click', closeMobileMenu);

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            closeMobileMenu();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

/**
 * Weather Widget - OpenWeatherMap Integration
 * Note: You'll need to add your API key
 */
const OPENWEATHER_API_KEY = 'f2e448edda185831ee6151bbffec8c5e';

const COLORADO_CITIES = [
    { name: 'Denver', lat: 39.7392, lon: -104.9903 },
    { name: 'Boulder', lat: 40.0150, lon: -105.2705 },
    { name: 'Estes Park', lat: 40.3772, lon: -105.5217 },
    { name: 'Colorado Springs', lat: 38.8339, lon: -104.8214 },
    { name: 'Vail', lat: 39.6403, lon: -106.3742 },
    { name: 'Aspen', lat: 39.1911, lon: -106.8175 }
];

async function initWeatherWidget() {
    const container = document.getElementById('weather-container');
    if (!container) return;

    // If no API key is set, show placeholder
    if (OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        container.innerHTML = generatePlaceholderWeather();
        return;
    }

    try {
        const weatherPromises = COLORADO_CITIES.map(city => fetchWeather(city));
        const weatherData = await Promise.all(weatherPromises);

        container.innerHTML = weatherData
            .filter(data => data !== null)
            .map(data => generateWeatherCard(data))
            .join('');
    } catch (error) {
        console.error('Weather fetch error:', error);
        container.innerHTML = '<p class="weather-loading">Weather data temporarily unavailable</p>';
    }
}

async function fetchWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
        );

        if (!response.ok) throw new Error('Weather API error');

        const data = await response.json();
        return {
            city: city.name,
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: getWeatherEmoji(data.weather[0].main)
        };
    } catch (error) {
        console.error(`Error fetching weather for ${city.name}:`, error);
        return null;
    }
}

function getWeatherEmoji(condition) {
    const conditions = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️'
    };
    return conditions[condition] || '🌤️';
}

function generateWeatherCard(data) {
    return `
        <div class="weather-card">
            <div class="weather-city">${data.city}</div>
            <div class="weather-icon">${data.icon}</div>
            <div class="weather-temp">${data.temp}°F</div>
            <div class="weather-desc">${data.description}</div>
        </div>
    `;
}

function generatePlaceholderWeather() {
    // Placeholder data when API key is not configured
    const placeholderData = [
        { city: 'Denver', temp: 55, icon: '☀️', desc: 'Sunny' },
        { city: 'Boulder', temp: 52, icon: '🌤️', desc: 'Partly Cloudy' },
        { city: 'Estes Park', temp: 45, icon: '☁️', desc: 'Cloudy' },
        { city: 'Colorado Springs', temp: 58, icon: '☀️', desc: 'Clear' },
        { city: 'Vail', temp: 38, icon: '❄️', desc: 'Snow' },
        { city: 'Aspen', temp: 35, icon: '🌨️', desc: 'Light Snow' }
    ];

    return placeholderData.map(data => `
        <div class="weather-card">
            <div class="weather-city">${data.city}</div>
            <div class="weather-icon">${data.icon}</div>
            <div class="weather-temp">${data.temp}°F</div>
            <div class="weather-desc">${data.desc}</div>
        </div>
    `).join('');
}

/**
 * News Feed Aggregator
 * Uses RSS feeds from multiple Colorado sources
 */
const NEWS_SOURCES = [
    {
        name: 'OutThere Colorado',
        url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.outtherecolorado.com/feed/',
        category: 'outdoor'
    },
    {
        name: 'NPS - Rocky Mountain',
        url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.nps.gov/feeds/getNewsRSS.htm?id=romo',
        category: 'parks'
    },
    {
        name: 'Visit Denver',
        url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.denver.org/feed/',
        category: 'events'
    }
];

async function initNewsFeed() {
    const container = document.getElementById('news-container');
    if (!container) return;

    try {
        // Fetch from multiple sources
        const newsPromises = NEWS_SOURCES.map(source => fetchNews(source));
        const results = await Promise.all(newsPromises);

        // Flatten and combine all news items
        let allNews = results
            .filter(result => result !== null)
            .flat()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6); // Show top 6 items

        if (allNews.length === 0) {
            // Show placeholder if no feeds available
            allNews = getPlaceholderNews();
        }

        container.innerHTML = allNews.map(item => generateNewsCard(item)).join('');
    } catch (error) {
        console.error('News fetch error:', error);
        container.innerHTML = getPlaceholderNews().map(item => generateNewsCard(item)).join('');
    }
}

async function fetchNews(source) {
    try {
        const response = await fetch(source.url);
        if (!response.ok) throw new Error('Feed fetch failed');

        const data = await response.json();

        if (data.status !== 'ok' || !data.items) return null;

        return data.items.slice(0, 3).map(item => ({
            title: item.title,
            link: item.link,
            date: item.pubDate,
            source: source.name,
            category: source.category
        }));
    } catch (error) {
        console.error(`Error fetching ${source.name}:`, error);
        return null;
    }
}

function generateNewsCard(item) {
    const date = item.date ? new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : '';

    return `
        <article class="news-card">
            <div class="news-source">${item.source}</div>
            <h3 class="news-title">
                <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
            </h3>
            ${date ? `<div class="news-date">${date}</div>` : ''}
        </article>
    `;
}

function getPlaceholderNews() {
    return [
        {
            title: 'Best Hiking Trails Opening for Spring Season',
            source: 'OutThere Colorado',
            date: new Date().toISOString(),
            link: 'https://www.outtherecolorado.com/',
            category: 'outdoor'
        },
        {
            title: 'Rocky Mountain National Park Trail Updates',
            source: 'NPS - Rocky Mountain',
            date: new Date().toISOString(),
            link: 'https://www.nps.gov/romo/index.htm',
            category: 'parks'
        },
        {
            title: 'Denver Restaurant Week Returns This Spring',
            source: 'Visit Denver',
            date: new Date().toISOString(),
            link: 'https://www.denver.org/',
            category: 'events'
        },
        {
            title: 'Colorado Ski Season Wrap-Up and Summer Plans',
            source: 'OutThere Colorado',
            date: new Date().toISOString(),
            link: 'https://www.outtherecolorado.com/',
            category: 'outdoor'
        },
        {
            title: 'New Exhibits Coming to Denver Art Museum',
            source: 'Visit Denver',
            date: new Date().toISOString(),
            link: 'https://www.denver.org/',
            category: 'events'
        },
        {
            title: 'Bear Lake Road Construction Schedule',
            source: 'NPS - Rocky Mountain',
            date: new Date().toISOString(),
            link: 'https://www.nps.gov/romo/index.htm',
            category: 'parks'
        }
    ];
}

/**
 * Instagram Lazy Load Embed System
 * Paste Instagram URLs and they'll be converted to lazy-loaded embeds
 */
function initInstagramEmbeds() {
    const container = document.getElementById('instagram-container');
    if (!container) return;

    // Find all Instagram embed placeholders
    const embedPlaceholders = container.querySelectorAll('[data-instagram-url]');

    if (embedPlaceholders.length === 0) return;

    // Set up Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadInstagramEmbed(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px'
        });

        embedPlaceholders.forEach(placeholder => {
            observer.observe(placeholder);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        embedPlaceholders.forEach(placeholder => {
            loadInstagramEmbed(placeholder);
        });
    }
}

function loadInstagramEmbed(element) {
    const url = element.dataset.instagramUrl;
    if (!url) return;

    // Extract the post ID from the URL
    const postId = extractInstagramId(url);
    if (!postId) return;

    // Create the embed HTML
    element.innerHTML = `
        <blockquote class="instagram-media"
            data-instgrm-permalink="${url}"
            data-instgrm-version="14"
            style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:calc(100% - 2px);">
        </blockquote>
    `;

    // Load Instagram embed script if not already loaded
    loadInstagramScript();
}

function extractInstagramId(url) {
    // Match patterns like instagram.com/p/XXXX or instagram.com/reel/XXXX
    const match = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
}

let instagramScriptLoaded = false;
function loadInstagramScript() {
    if (instagramScriptLoaded) {
        // If script is already loaded, just process embeds
        if (window.instgrm) {
            window.instgrm.Embeds.process();
        }
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = function() {
        instagramScriptLoaded = true;
        if (window.instgrm) {
            window.instgrm.Embeds.process();
        }
    };
    document.body.appendChild(script);
}

/**
 * Helper function to add Instagram posts programmatically
 * Call this function with an array of Instagram URLs
 */
function addInstagramPosts(urls) {
    const container = document.getElementById('instagram-container');
    if (!container) return;

    // Clear placeholder
    const placeholder = container.querySelector('.instagram-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    urls.forEach(url => {
        const wrapper = document.createElement('div');
        wrapper.className = 'instagram-embed loading';
        wrapper.dataset.instagramUrl = url;
        wrapper.innerHTML = '<span>Loading Instagram post...</span>';
        container.appendChild(wrapper);
    });

    // Re-initialize to trigger lazy loading
    initInstagramEmbeds();
}

// Expose function globally for easy use
window.addInstagramPosts = addInstagramPosts;

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                const header = document.querySelector('.site-header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    });
}

/**
 * Header scroll effect
 */
let lastScroll = 0;
const header = document.querySelector('.site-header');

if (header && window.innerWidth > 768) {
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }

        lastScroll = currentScroll;
    });
}

console.log('Denver Sam Colorado Guide loaded successfully!');
