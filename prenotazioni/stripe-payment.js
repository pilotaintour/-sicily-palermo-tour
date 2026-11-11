/**
 * MODULO MASTER PAGAMENTI STRIPE & PAYPAL (ORCHESTRATORE)
 * Sicily Palermo Tour - Unifica il modulo Cliente (Step 4), il modulo Admin (Incassi/Rimborsi) e Stripe Connect (Partner)
 */

class UnifiedStripePaymentManager {
    constructor() {
        this.init();
    }

    init() {
        if (window.stripeClientCheckout && typeof window.stripeClientCheckout.init === 'function') {
            window.stripeClientCheckout.init();
        }
    }

    get stripe() {
        return window.stripeClientCheckout ? window.stripeClientCheckout.stripe : null;
    }

    get elements() {
        return window.stripeClientCheckout ? window.stripeClientCheckout.elements : null;
    }

    get cardNumber() {
        return window.stripeClientCheckout ? window.stripeClientCheckout.cardNumber : null;
    }

    get isMounted() {
        return window.stripeClientCheckout ? window.stripeClientCheckout.isMounted : false;
    }

    getPublishableKey() {
        if (window.adminStripeManager) return window.adminStripeManager.getPublishableKey();
        if (window.stripeClientCheckout) return window.stripeClientCheckout.getPublishableKey();
        return 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
    }

    getSecretKey() {
        if (window.adminStripeManager) return window.adminStripeManager.getSecretKey();
        if (window.stripeClientCheckout) return window.stripeClientCheckout.getSecretKey();
        return '';
    }

    saveKeys(publishableKey, secretKey) {
        if (window.adminStripeManager) {
            window.adminStripeManager.saveKeys(publishableKey, secretKey);
        }
        if (window.stripeClientCheckout) {
            window.stripeClientCheckout.init();
        }
    }

    autoCompilaTestCard() {
        if (window.stripeClientCheckout) {
            window.stripeClientCheckout.autoCompilaTestCard();
        }
    }

    mountCardForm(containerId) {
        if (window.stripeClientCheckout) {
            window.stripeClientCheckout.mountCardForm(containerId);
        }
    }

    renderPayPalSmartButtons() {
        if (window.stripeClientCheckout) {
            window.stripeClientCheckout.renderPayPalSmartButtons();
        }
    }

    aggiornaAnteprimaCarta(valore) {
        if (window.stripeClientCheckout) {
            window.stripeClientCheckout.aggiornaAnteprimaCarta(valore);
        }
    }

    async processaPreAutorizzazione(totaleEuro, customerName, customerEmail, options = {}) {
        if (window.stripeClientCheckout) {
            return await window.stripeClientCheckout.processaPreAutorizzazione(totaleEuro, customerName, customerEmail, options);
        }
        return { success: true, paymentIntentId: 'pi_simulated_' + Date.now() };
    }

    async incassaImportoPreAutorizzato(intentId, importoCustom) {
        if (window.adminStripeManager) {
            return await window.adminStripeManager.incassaImportoPreAutorizzato(intentId, importoCustom);
        }
        return true;
    }

    async sbloccaImportoCarta(intentId, importoRimborsoCustom) {
        if (window.adminStripeManager) {
            return await window.adminStripeManager.sbloccaImportoCarta(intentId, importoRimborsoCustom);
        }
        return true;
    }

    async creaAccountStripeConnectDaIBAN(partnerData = {}) {
        if (window.stripeConnectPromoter) {
            return await window.stripeConnectPromoter.creaAccountStripeConnectDaIBAN(partnerData);
        }
        return null;
    }
}

// Istanza globale unificata del gestore pagamenti Stripe
window.stripePayment = new UnifiedStripePaymentManager();
