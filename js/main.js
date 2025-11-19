document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
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
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Close mobile menu if open
                navLinks.classList.remove('active');

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

    // Contact Form Submission Handler
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            formStatus.style.display = 'none';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success
                    formStatus.innerHTML = '<p style="color: var(--primary); font-weight: 600;"><i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.</p>';
                    formStatus.style.display = 'block';
                    contactForm.reset();
                } else {
                    // Error
                    formStatus.innerHTML = '<p style="color: #ff6b6b; font-weight: 600;"><i class="fas fa-exclamation-circle"></i> Oops! There was a problem. Please try again.</p>';
                    formStatus.style.display = 'block';
                }
            } catch (error) {
                // Network error
                formStatus.innerHTML = '<p style="color: #ff6b6b; font-weight: 600;"><i class="fas fa-exclamation-circle"></i> Network error. Please check your connection and try again.</p>';
                formStatus.style.display = 'block';
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});
