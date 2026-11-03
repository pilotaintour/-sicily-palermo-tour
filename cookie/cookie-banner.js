/**
 * MODULO AUTONOMO COOKIE CONSENT GDPR - Sicily Palermo Tour
 * Gestione automatica Banner Cookie, salvataggio preferenze in localStorage e conformità ePrivacy
 */

const COOKIE_CONSENT_KEY = 'spt_cookie_consent';

class CookieConsentManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.verificaEmostraBanner();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.verificaEmostraBanner());
        }
    }

    // Verifica se l'utente ha già espresso una preferenza
    getConsentState() {
        return localStorage.getItem(COOKIE_CONSENT_KEY);
    }

    verificaEmostraBanner() {
        const consent = this.getConsentState();
        if (!consent) {
            this.renderBanner();
        }
    }

    renderBanner() {
        if (document.getElementById('gdpr-cookie-banner')) return;

        const bannerHtml = `
            <div id="gdpr-cookie-banner" class="cookie-banner-container">
                <div class="cookie-banner-content">
                    <div class="cookie-banner-text-box">
                        <div class="cookie-banner-header">
                            <span class="cookie-icon">🍪</span>
                            <strong class="cookie-title">Informativa sui Cookie &amp; Privacy</strong>
                        </div>
                        <p class="cookie-desc">
                            Utilizziamo cookie tecnici essenziali per garantire il funzionamento della prenotazione, della lingua e della sicurezza, oltre a cookie di analisi anonimi per migliorare il nostro servizio. Consulta la nostra <a href="prenotazioni/termini-condizioni.html" target="_blank" class="cookie-link">Informativa sulla Privacy &amp; Cookie Policy</a>.
                        </p>
                    </div>
                    <div class="cookie-banner-actions">
                        <button type="button" class="btn-cookie-necessary" onclick="window.cookieConsent.accettaNecessari()">
                            🛡️ Solo Necessari
                        </button>
                        <button type="button" class="btn-cookie-accept" onclick="window.cookieConsent.accettaTutti()">
                            ✅ Accetta Tutti
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHtml);

        setTimeout(() => {
            const el = document.getElementById('gdpr-cookie-banner');
            if (el) el.classList.add('show');
        }, 300);
    }

    accettaTutti() {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        this.nascondiBanner();
    }

    accettaNecessari() {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'necessary');
        this.nascondiBanner();
    }

    nascondiBanner() {
        const el = document.getElementById('gdpr-cookie-banner');
        if (el) {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 400);
        }
    }

    // Riapre il banner per permettere all'utente di cambiare preferenze dal Footer
    riaprePreferenze() {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        this.renderBanner();
    }
}

// Istanza globale del controller Cookie
window.cookieConsent = new CookieConsentManager();
