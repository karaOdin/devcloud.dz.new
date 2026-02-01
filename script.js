// DevCloud — Interactions

(function () {
    'use strict';

    // --- Reduced motion check ---
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Dark mode ---
    function getPreferredTheme() {
        var stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    applyTheme(getPreferredTheme());

    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- Navigation scroll ---
    var nav = document.getElementById('nav');

    function handleNavScroll() {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // --- Mobile nav toggle ---
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- Smooth scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                var offset = nav ? nav.offsetHeight + 16 : 80;
                var top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // --- Staggered scroll reveal ---
    var revealElements = document.querySelectorAll(
        '.card, .featured-grid, .partnership-grid, .contact-grid, .hero-stat, .pp-feature-block, .pp-value-card, .cr-feature-block, .cp-feature-block, .cp-about-card, .cp-process-step'
    );

    revealElements.forEach(function (el) {
        el.classList.add('reveal');
    });

    // Group elements by parent for stagger
    var revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;

                    // Find siblings in same grid for stagger
                    var parent = el.parentElement;
                    var siblings = parent ? Array.from(parent.querySelectorAll('.reveal:not(.visible)')) : [];
                    var idx = siblings.indexOf(el);
                    var delay = idx >= 0 ? idx * 80 : 0;

                    if (prefersReducedMotion) {
                        el.classList.add('visible');
                    } else {
                        setTimeout(function () {
                            el.classList.add('visible');
                        }, delay);
                    }

                    revealObserver.unobserve(el);
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    revealElements.forEach(function (el) {
        revealObserver.observe(el);
    });

    // --- Counter animation for hero stats ---
    function animateCounter(el) {
        var text = el.textContent.trim();
        var suffix = '';
        var numStr = text;

        // Extract suffix like +, %, K
        var match = text.match(/^([\d,.]+)(.*)$/);
        if (!match) return;

        numStr = match[1].replace(/,/g, '');
        suffix = match[2];

        var target = parseFloat(numStr);
        var isDecimal = numStr.indexOf('.') !== -1;
        var hasComma = match[1].indexOf(',') !== -1;
        var duration = 1800;
        var start = null;

        function formatNum(n) {
            if (isDecimal) {
                var s = n.toFixed(1);
                return hasComma ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s;
            }
            var s = Math.round(n).toString();
            return hasComma ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s;
        }

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = easeOutExpo(progress);
            el.textContent = formatNum(target * eased) + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        if (prefersReducedMotion) return;
        el.textContent = formatNum(0) + suffix;
        requestAnimationFrame(step);
    }

    var statNums = document.querySelectorAll('.hero-stat-num');
    if (statNums.length) {
        var statsObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        statsObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        statNums.forEach(function (el) {
            statsObserver.observe(el);
        });
    }

    // --- Dashboard bar animation ---
    var dashBars = document.querySelectorAll('.dash-bar');
    if (dashBars.length) {
        dashBars.forEach(function (bar) {
            bar.dataset.height = bar.style.getPropertyValue('--h');
            bar.style.setProperty('--h', '0%');
        });

        var barsObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var bars = entry.target.querySelectorAll('.dash-bar');
                        bars.forEach(function (bar, i) {
                            setTimeout(function () {
                                bar.style.setProperty('--h', bar.dataset.height);
                            }, i * 60);
                        });
                        barsObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        var dashBarsContainer = document.querySelector('.dash-bars');
        if (dashBarsContainer) barsObserver.observe(dashBarsContainer);
    }

    // --- Hero parallax glow ---
    var heroGlow = document.querySelector('.hero-glow');
    if (heroGlow && !prefersReducedMotion) {
        var hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mousemove', function (e) {
                var rect = hero.getBoundingClientRect();
                var x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
                var y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
                heroGlow.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            });

            hero.addEventListener('mouseleave', function () {
                heroGlow.style.transform = 'translate(0, 0)';
                heroGlow.style.transition = 'transform 0.6s ease';
                setTimeout(function () {
                    heroGlow.style.transition = '';
                }, 600);
            });
        }
    }

    // --- Contact form ---
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = contactForm.querySelector('button[type="submit"]');
            var i18n = window.DevCloudI18n;
            var sendingText = i18n ? i18n.t('contact.form_sending') : 'Sending...';
            var sentText = i18n ? i18n.t('contact.form_sent') : 'Message Sent';
            var submitText = i18n ? i18n.t('contact.form_submit') : 'Send Message';
            btn.textContent = sendingText;
            btn.disabled = true;
            btn.classList.add('btn--loading');

            setTimeout(function () {
                btn.textContent = sentText;
                btn.classList.remove('btn--loading');
                btn.classList.add('btn--success');
                setTimeout(function () {
                    btn.textContent = submitText;
                    btn.classList.remove('btn--success');
                    btn.disabled = false;
                    contactForm.reset();
                }, 2500);
            }, 1000);
        });
    }

    // --- Pause trust logo scroll on hover ---
    var trustTrack = document.querySelector('.trust-track');
    if (trustTrack) {
        trustTrack.addEventListener('mouseenter', function () {
            trustTrack.style.animationPlayState = 'paused';
        });
        trustTrack.addEventListener('mouseleave', function () {
            trustTrack.style.animationPlayState = 'running';
        });
    }
})();
