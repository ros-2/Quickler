(function () {
    const CONSENT_KEY = "quickler_cookie_consent_v1";
    const GA_ID = "G-NM61T48RDV";
    const BANNER_ID = "quickler-cookie-banner";

    function getConsent() {
        try {
            return window.localStorage.getItem(CONSENT_KEY);
        } catch (error) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            window.localStorage.setItem(CONSENT_KEY, value);
        } catch (error) {
            return;
        }
    }

    function loadAnalytics() {
        if (window.__quicklerAnalyticsLoaded) return;

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", GA_ID, {
            anonymize_ip: true
        });

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
        document.head.appendChild(script);

        window.__quicklerAnalyticsLoaded = true;
    }

    function removeBanner() {
        const existing = document.getElementById(BANNER_ID);
        if (existing) existing.remove();
    }

    function openBanner() {
        removeBanner();

        const banner = document.createElement("div");
        banner.id = BANNER_ID;
        banner.className = "cookie-banner";
        banner.innerHTML = `
            <div class="cookie-banner-title">Cookie settings</div>
            <p class="cookie-banner-copy">
                Quickler uses analytics cookies only if you allow them.
                They help me understand which pages are useful.
                See the <a href="/pages/privacy.html">Privacy Policy</a>.
            </p>
            <div class="cookie-banner-actions">
                <button type="button" class="cookie-button cookie-button-accept" data-cookie-action="accept">Accept analytics</button>
                <button type="button" class="cookie-button cookie-button-decline" data-cookie-action="decline">Decline</button>
                <button type="button" class="cookie-button cookie-button-settings" data-cookie-action="close">Close</button>
            </div>
        `;

        document.body.appendChild(banner);

        banner.addEventListener("click", function (event) {
            const button = event.target.closest("[data-cookie-action]");
            if (!button) return;

            const action = button.getAttribute("data-cookie-action");
            if (action === "accept") {
                setConsent("granted");
                loadAnalytics();
                removeBanner();
            } else if (action === "decline") {
                setConsent("denied");
                removeBanner();
            } else if (action === "close") {
                removeBanner();
            }
        });
    }

    if (getConsent() === "granted") {
        loadAnalytics();
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!getConsent()) {
            openBanner();
        }

        document.addEventListener("click", function (event) {
            const trigger = event.target.closest("[data-cookie-settings]");
            if (!trigger) return;
            event.preventDefault();
            openBanner();
        });
    });
})();
