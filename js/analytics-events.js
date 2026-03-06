// Lightweight conversion tracking for CTA clicks and form activity.
(function () {
    function track(eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, params || {});
    }

    document.addEventListener('click', function (event) {
        const cta = event.target.closest('a.btn');
        if (!cta) return;

        const label = (cta.getAttribute('data-cta') || cta.textContent || '').trim();
        const target = cta.getAttribute('href') || '';
        track('cta_click', {
            cta_label: label,
            cta_target: target,
            page_path: window.location.pathname
        });
    });

    document.addEventListener('submit', function (event) {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;

        track('form_submit_attempt', {
            form_id: form.id || 'unknown_form',
            page_path: window.location.pathname
        });
    });
})();
