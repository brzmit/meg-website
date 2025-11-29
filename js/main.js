document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const headerRight = document.querySelector('.header-right');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            headerRight.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === "#") return; // Ignore placeholder links

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Close mobile menu if open
                const headerRight = document.querySelector('.header-right');
                headerRight.classList.remove('active');
                const mobileToggle = document.querySelector('.mobile-toggle');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }

                // Scroll to target
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Intersection Observer for Fade-in Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .section-title').forEach(el => {
        observer.observe(el);
    });

    // --- GSAP Animations ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Staggered Fade-in for Services
        gsap.from(".service-card", {
            scrollTrigger: {
                trigger: ".services-grid",
                start: "top 80%", // Start when top of grid hits 80% of viewport
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2, // 0.2s delay between each card
            ease: "power2.out"
        });
    }

    // --- Active Navigation Highlight ---
    const sections = document.querySelectorAll("section");
    const navLi = document.querySelectorAll(".nav-links li a");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 150) { // -150 offset for header
                current = section.getAttribute("id");
            }
        });

        navLi.forEach((a) => {
            a.classList.remove("active");
            if (a.getAttribute("href") === "#" + current) {
                a.classList.add("active");
            }
        });
    });

    // --- Contact Form Handling ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitButton.innerText;

            // Show loading state
            submitButton.innerText = 'Sending...';
            submitButton.disabled = true;
            formStatus.style.display = 'block'; // Make visible
            formStatus.innerHTML = '';
            formStatus.className = 'form-status';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.innerHTML = '<div class="success-message">Thank you! Your message has been delivered. We will be in touch shortly.</div>';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwnProperty.call(data, 'errors')) {
                        formStatus.innerHTML = `<div class="error-message">${data.errors.map(error => error.message).join(", ")}</div>`;
                    } else {
                        formStatus.innerHTML = '<div class="error-message">Oops! There was a problem submitting your form.</div>';
                    }
                }
            } catch (error) {
                formStatus.innerHTML = '<div class="error-message">Oops! There was a problem submitting your form.</div>';
            } finally {
                submitButton.innerText = originalBtnText;
                submitButton.disabled = false;
            }
        });
    }
    // --- Calendly Integration ---
    const loadCalendly = () => {
        return new Promise((resolve, reject) => {
            if (window.Calendly) {
                resolve();
                return;
            }

            // Load CSS
            const link = document.createElement('link');
            link.href = 'https://assets.calendly.com/assets/external/widget.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            // Load JS
            const script = document.createElement('script');
            script.src = 'https://assets.calendly.com/assets/external/widget.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Calendly script failed to load'));
            document.body.appendChild(script);
        });
    };

    const openCalendlyPopup = () => {
        loadCalendly().then(() => {
            Calendly.initPopupWidget({
                url: 'https://calendly.com/brandon-mitchellenterprisegrp/30min',
                text: 'Schedule time with me',
                color: '#0099CC',
                textColor: '#ffffff',
                branding: true
            });
        }).catch(err => console.error(err));
    };

    // Attach click listeners to all triggers
    document.querySelectorAll('.calendly-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCalendlyPopup();
        });
    });

    // Lazy load on scroll to contact section
    let calendlyLoaded = false;
    const contactSection = document.querySelector('#contact');

    const calendlyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !calendlyLoaded) {
                loadCalendly();
                calendlyLoaded = true;
            }
        });
    });

    if (contactSection) {
        calendlyObserver.observe(contactSection);
    }

    // --- Sticky CTA for Mobile ---
    const stickyCTA = document.querySelector('.sticky-cta-mobile');
    const heroSection = document.querySelector('.hero');

    if (stickyCTA && heroSection) {
        window.addEventListener('scroll', () => {
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            const scrollPosition = window.scrollY + window.innerHeight;

            // Show sticky CTA after scrolling past hero section
            if (window.scrollY > heroBottom - 200) {
                stickyCTA.classList.add('visible');
            } else {
                stickyCTA.classList.remove('visible');
            }
        });
    }
});
