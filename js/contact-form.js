// Handle contact form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const form = e.target;
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.textContent;

            // Show sending state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                // Submit to Formspree
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'form_submit_success', {
                            form_id: 'contact-form',
                            page_path: window.location.pathname
                        });
                    }

                    // Show sent state
                    submitBtn.textContent = 'Sent! I\'ll reply within 24 hours';

                    // Reset form after 10 seconds
                    setTimeout(() => {
                        form.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 10000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'form_submit_error', {
                        form_id: 'contact-form',
                        page_path: window.location.pathname
                    });
                }

                // Show error and reset
                submitBtn.textContent = 'Failed - try again';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }
});
