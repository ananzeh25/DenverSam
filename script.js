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
    { name: 'Denver', lat: 39.7392, lon: -104.9903 }
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
        const city = COLORADO_CITIES[0];
        const [currentWeather, forecast] = await Promise.all([
            fetchWeather(city),
            fetchForecast(city)
        ]);

        if (currentWeather) {
            container.innerHTML = generateWeatherWidget(currentWeather, forecast);
        } else {
            container.innerHTML = generatePlaceholderWeather();
        }
    } catch (error) {
        console.error('Weather fetch error:', error);
        container.innerHTML = generatePlaceholderWeather();
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
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed),
            description: data.weather[0].description,
            icon: getWeatherEmoji(data.weather[0].main)
        };
    } catch (error) {
        console.error(`Error fetching weather for ${city.name}:`, error);
        return null;
    }
}

async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
        );

        if (!response.ok) throw new Error('Forecast API error');

        const data = await response.json();

        // Get one forecast per day (noon time)
        const dailyForecasts = [];
        const seenDays = new Set();

        for (const item of data.list) {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();

            if (!seenDays.has(dayKey) && date.getHours() >= 11 && date.getHours() <= 14) {
                seenDays.add(dayKey);
                dailyForecasts.push({
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    temp: Math.round(item.main.temp),
                    icon: getWeatherEmoji(item.weather[0].main)
                });
            }

            if (dailyForecasts.length >= 5) break;
        }

        return dailyForecasts;
    } catch (error) {
        console.error('Error fetching forecast:', error);
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

function generateWeatherWidget(data, forecast) {
    let forecastHtml = '';
    if (forecast && forecast.length > 0) {
        forecastHtml = `
            <div class="weather-forecast">
                ${forecast.map(day => `
                    <div class="forecast-day">
                        <div class="forecast-day-name">${day.day}</div>
                        <div class="forecast-icon">${day.icon}</div>
                        <div class="forecast-temp">${day.temp}°</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    return `
        <div class="weather-widget">
            <div class="weather-main">
                <div class="weather-icon">${data.icon}</div>
                <div class="weather-temp-block">
                    <div class="weather-city">${data.city}</div>
                    <div class="weather-temp">${data.temp}°F</div>
                    <div class="weather-desc">${data.description}</div>
                </div>
            </div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <div class="weather-detail-label">Feels Like</div>
                    <div class="weather-detail-value">${data.feelsLike}°F</div>
                </div>
                <div class="weather-detail-item">
                    <div class="weather-detail-label">Humidity</div>
                    <div class="weather-detail-value">${data.humidity}%</div>
                </div>
                <div class="weather-detail-item">
                    <div class="weather-detail-label">Wind</div>
                    <div class="weather-detail-value">${data.wind} mph</div>
                </div>
            </div>
            ${forecastHtml}
        </div>
    `;
}

function generatePlaceholderWeather() {
    const placeholderForecast = [
        { day: 'Mon', temp: 52, icon: '☀️' },
        { day: 'Tue', temp: 48, icon: '🌤️' },
        { day: 'Wed', temp: 55, icon: '☀️' },
        { day: 'Thu', temp: 45, icon: '☁️' },
        { day: 'Fri', temp: 50, icon: '🌤️' }
    ];

    return `
        <div class="weather-widget">
            <div class="weather-main">
                <div class="weather-icon">☀️</div>
                <div class="weather-temp-block">
                    <div class="weather-city">Denver</div>
                    <div class="weather-temp">55°F</div>
                    <div class="weather-desc">Sunny</div>
                </div>
            </div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <div class="weather-detail-label">Feels Like</div>
                    <div class="weather-detail-value">52°F</div>
                </div>
                <div class="weather-detail-item">
                    <div class="weather-detail-label">Humidity</div>
                    <div class="weather-detail-value">35%</div>
                </div>
                <div class="weather-detail-item">
                    <div class="weather-detail-label">Wind</div>
                    <div class="weather-detail-value">8 mph</div>
                </div>
            </div>
            <div class="weather-forecast">
                ${placeholderForecast.map(day => `
                    <div class="forecast-day">
                        <div class="forecast-day-name">${day.day}</div>
                        <div class="forecast-icon">${day.icon}</div>
                        <div class="forecast-temp">${day.temp}°</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * News Feed Aggregator
 * Uses RSS feeds from multiple Colorado sources
 */
const NEWS_SOURCES = [
    {
        name: 'YouTube',
        url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=UC72nbKQLSDyiSARhg0Ywj4w',
        category: 'videos'
    },
    {
        name: 'Denver7',
        url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.denver7.com/news/local-news.rss',
        category: 'news'
    },
    {
        name: 'FOX31',
        url: 'https://api.rss2json.com/v1/api.json?rss_url=https://kdvr.com/news/feed/',
        category: 'news'
    }
];

// Store all news items for "Show More" functionality
let allNewsItems = [];
let currentlyShown = 0;
const ITEMS_PER_PAGE = 6;
const MAX_ITEMS = 24;

async function initNewsFeed() {
    const container = document.getElementById('news-container');
    if (!container) return;

    try {
        // Fetch from multiple sources
        const newsPromises = NEWS_SOURCES.map(source => fetchNews(source));
        const results = await Promise.all(newsPromises);

        // Flatten and combine all news items
        allNewsItems = results
            .filter(result => result !== null)
            .flat()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, MAX_ITEMS); // Store up to MAX_ITEMS

        if (allNewsItems.length === 0) {
            // Show placeholder if no feeds available
            allNewsItems = getPlaceholderNews();
        }

        // Show initial items
        currentlyShown = Math.min(ITEMS_PER_PAGE, allNewsItems.length);
        renderNewsItems(container);
    } catch (error) {
        console.error('News fetch error:', error);
        allNewsItems = getPlaceholderNews();
        currentlyShown = allNewsItems.length;
        renderNewsItems(container);
    }
}

function renderNewsItems(container) {
    const itemsToShow = allNewsItems.slice(0, currentlyShown);
    let html = itemsToShow.map(item => generateNewsCard(item)).join('');

    // Add "Show More" button if there are more items to show
    if (currentlyShown < allNewsItems.length) {
        html += `
            <div class="news-show-more-container">
                <button class="news-show-more-btn" onclick="showMoreNews()">
                    Show More News
                </button>
            </div>
        `;
    }

    container.innerHTML = html;
}

function showMoreNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    currentlyShown = Math.min(currentlyShown + ITEMS_PER_PAGE, allNewsItems.length);
    renderNewsItems(container);

    // Scroll smoothly to the new items
    const newsCards = container.querySelectorAll('.news-card');
    if (newsCards.length > ITEMS_PER_PAGE) {
        const targetCard = newsCards[newsCards.length - ITEMS_PER_PAGE];
        if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Expose function globally
window.showMoreNews = showMoreNews;

async function fetchNews(source) {
    try {
        const response = await fetch(source.url);
        if (!response.ok) throw new Error('Feed fetch failed');

        const data = await response.json();

        if (data.status !== 'ok' || !data.items) return null;

        // Use feed title for YouTube channels, otherwise use configured source name
        let channelName = source.name;
        if (source.category === 'videos' && data.feed?.title) {
            channelName = data.feed.title;
        }

        return data.items.slice(0, 3).map(item => ({
            title: item.title,
            link: item.link,
            date: item.pubDate,
            source: channelName,
            category: source.category,
            thumbnail: extractThumbnail(item, source.category)
        }));
    } catch (error) {
        console.error(`Error fetching ${source.name}:`, error);
        return null;
    }
}

function extractThumbnail(item, category) {
    // For YouTube videos, extract from video ID
    if (category === 'videos' && item.link) {
        const videoIdMatch = item.link.match(/[?&]v=([^&]+)/) || item.link.match(/youtube\.com\/watch\?v=([^&]+)/);
        if (videoIdMatch) {
            return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
        }
        // YouTube RSS feed format
        const ytIdMatch = item.link.match(/youtube\.com\/watch\?v=([^&]+)/);
        if (ytIdMatch) {
            return `https://img.youtube.com/vi/${ytIdMatch[1]}/mqdefault.jpg`;
        }
    }

    // Check common thumbnail locations in RSS
    if (item.thumbnail) return item.thumbnail;
    if (item.enclosure?.link) return item.enclosure.link;
    if (item.enclosure?.url) return item.enclosure.url;

    // Try to extract image from content/description
    if (item.content) {
        const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) return imgMatch[1];
    }
    if (item.description) {
        const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) return imgMatch[1];
    }

    return null;
}

function generateNewsCard(item) {
    const date = item.date ? new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/Denver'
    }) : '';

    const placeholderThumb = `<div class="placeholder-thumb"><span>No</span><span>Image</span></div>`;
    const thumbnailHtml = item.thumbnail
        ? `<div class="news-thumbnail"><img src="${item.thumbnail}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="placeholder-thumb" style="display:none"><span>No</span><span>Image</span></div></div>`
        : `<div class="news-thumbnail">${placeholderThumb}</div>`;

    return `
        <article class="news-card has-thumbnail">
            ${thumbnailHtml}
            <div class="news-content">
                <div class="news-source">${item.source}</div>
                <h3 class="news-title">
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                </h3>
                ${date ? `<div class="news-date">${date}</div>` : ''}
            </div>
        </article>
    `;
}

function getPlaceholderNews() {
    return [
        {
            title: 'Exploring Colorado with Denver Sam',
            source: 'Denver Sam',
            date: new Date().toISOString(),
            link: 'https://www.youtube.com/@DenverSam',
            category: 'videos'
        },
        {
            title: 'Best Places to Visit in Denver',
            source: 'Denver Sam',
            date: new Date().toISOString(),
            link: 'https://www.youtube.com/@DenverSam',
            category: 'videos'
        },
        {
            title: 'Colorado Travel Guide',
            source: 'Denver Sam',
            date: new Date().toISOString(),
            link: 'https://www.youtube.com/@DenverSam',
            category: 'videos'
        }
    ];
}

/**
 * Instagram Lazy Load Embed System
 * Paste Instagram URLs and they'll be converted to lazy-loaded embeds
 */
function initInstagramEmbeds() {
    // Find all Instagram embed placeholders anywhere on the page
    const embedPlaceholders = document.querySelectorAll('[data-instagram-url]');

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
