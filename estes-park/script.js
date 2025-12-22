/**
 * Estes Park Colorado - Main JavaScript
 * Handles mobile menu, smooth scrolling, and menu toggles
 */

/**
 * Generic menu toggle function for restaurant menu sections
 * @param {string} menuId - ID of the menu content element to toggle
 * @param {string} buttonId - ID of the toggle button element
 */
function toggleMenuSection(menuId, buttonId) {
    var menuExtra = document.getElementById(menuId);
    var toggleBtn = document.getElementById(buttonId);

    if (!menuExtra || !toggleBtn) return;

    if (menuExtra.style.display === 'none' || menuExtra.style.display === '') {
        menuExtra.style.display = 'block';
        toggleBtn.textContent = 'Show Less ▲';
    } else {
        menuExtra.style.display = 'none';
        toggleBtn.textContent = 'Show More Menu Items ▼';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Elements
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu nav a, .mobile-menu .book-btn');

    // Ensure elements exist before adding listeners
    if (mobileMenuToggle && mobileMenu && mobileMenuClose) {
        // Open mobile menu
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            mobileMenu.setAttribute('aria-hidden', 'false');
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            mobileMenuClose.focus();
        });

        // Close mobile menu function
        function closeMobileMenu() {
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-hidden', 'true');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            mobileMenuToggle.focus();
        }

        // Close button click
        mobileMenuClose.addEventListener('click', closeMobileMenu);

        // Close menu when clicking on a link
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                closeMobileMenu();
            });
        });

        // Close menu when clicking outside content
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });

        // Close menu with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                // Get header height for offset
                const header = document.querySelector('.site-header');
                const headerHeight = header ? header.offsetHeight : 0;

                // Calculate position
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    });

    // Add scroll effect to header (optional enhancement)
    let lastScroll = 0;
    const header = document.querySelector('.site-header');

    if (header && window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            // Add shadow on scroll
            if (currentScroll > 50) {
                header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }

            lastScroll = currentScroll;
        });
    }

    // FAQ accordion enhancement (optional)
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            // Optional: Add active state visual feedback
            this.style.backgroundColor = '#f0f9ff';
            setTimeout(() => {
                this.style.backgroundColor = '#fff';
            }, 300);
        });
    });

    // Log analytics events for external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function() {
            const url = this.getAttribute('href');
            // Check if gtag is available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'outbound',
                    'event_label': url,
                    'transport_type': 'beacon'
                });
            }
        });
    });

    // Track scroll depth for analytics
    let scrollDepths = [25, 50, 75, 100];
    let scrollDepthTracked = [];

    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const scrollPercentage = (scrolled / documentHeight) * 100;

        scrollDepths.forEach(depth => {
            if (scrollPercentage >= depth && !scrollDepthTracked.includes(depth)) {
                scrollDepthTracked.push(depth);

                // Track with Google Analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll_depth', {
                        'event_category': 'engagement',
                        'event_label': depth + '%',
                        'value': depth
                    });
                }
            }
        });
    });

    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.cta-button, .book-now-btn, .primary-btn, .book-btn');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();

            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', {
                    'event_category': 'engagement',
                    'event_label': buttonText
                });
            }
        });
    });

    // Performance: Lazy load images if any are added later
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }

    console.log('Estes Park Colorado site loaded successfully!');
});
