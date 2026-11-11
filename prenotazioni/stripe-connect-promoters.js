/**
 * MODULO AUTONOMO: Stripe Connect Split Payment & Gestione IBAN Rivenditori / Promoter
 * Sicily Palermo Tour - Gestione Automatica Accrediti Partner e Fisco alla Fonte
 */

class StripeConnectPromoterManager {
    constructor() {
        this.init();
    }

    init() {
        console.log("⚡ Modulo Stripe Connect & Rivenditori Inizializzato.");
    }

    getSecretKey() {
        if (window.stripePayment && typeof window.stripePayment.getSecretKey === 'function') {
            return window.stripePayment.getSecretKey();
        }
        const saved = localStorage.getItem('spt_stripe_sk') || localStorage.getItem('STRIPE_SK_KEY');
        if (saved && saved.startsWith('sk_test_') && saved.length > 30) {
            return saved;
        }
        return '';
    }

    // Crea ed unisce automaticamente un account Stripe Connect per inviare i bonifici SEPA all'IBAN del partner
    async creaAccountStripeConnectDaIBAN(partnerData = {}) {
        const sk = this.getSecretKey();
        const iban = (partnerData.iban || '').replace(/\s+/g, '').toUpperCase();
        if (!iban || iban.length < 15) return null;

        if (sk && sk.startsWith('sk_')) {
            try {
                const params = new URLSearchParams();
                params.append('type', 'custom');
                params.append('country', 'IT');
                params.append('email', partnerData.email || 'partner@example.com');
                params.append('business_type', 'individual');
                params.append('external_account[object]', 'bank_account');
                params.append('external_account[country]', 'IT');
                params.append('external_account[currency]', 'eur');
                params.append('external_account[account_number]', iban);
                params.append('capabilities[transfers][requested]', 'true');
                params.append('tos_acceptance[date]', Math.floor(Date.now() / 1000).toString());
                params.append('tos_acceptance[ip]', '127.0.0.1');

                const res = await fetch('https://api.stripe.com/v1/accounts', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + sk,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("⚡ Connected Account registrato con IBAN su Stripe! ID Account:", data.id);
                    return data.id;
                } else {
                    const errData = await res.json();
                    console.warn("Avviso registrazione IBAN su Stripe Connect:", errData);
                }
            } catch (e) {
                console.error("Errore creazione Stripe Connect Account da IBAN:", e);
            }
        }

        // Genera ID Account Stripe Connect di Test per la simulazione
        const testCode = (partnerData.code || partnerData.name || 'TEST').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const simulatedAccountId = 'acct_1TEST_' + testCode + '_' + Math.floor(100000 + Math.random() * 900000);
        console.log("⚡ Generato ID Account Stripe Connect di Test:", simulatedAccountId);
        return simulatedAccountId;
    }

    // Configura i parametri per lo Split Payment Stripe Connect nel PaymentIntent
    applicaSplitPayment(params, stripeConnectAccountId, commissionAmount) {
        if (stripeConnectAccountId && stripeConnectAccountId.startsWith('acct_') && commissionAmount > 0) {
            const commCents = Math.round(commissionAmount * 100);
            params.append('transfer_data[destination]', stripeConnectAccountId);
            params.append('transfer_data[amount]', commCents.toString());
            params.append('metadata[stripe_connect_split]', 'true');
            params.append('metadata[partner_commission_cents]', commCents.toString());
            console.log(`⚡ Stripe Connect Split Payment configurato: ${commissionAmount}€ (${commCents} cents) verso ${stripeConnectAccountId}`);
            return true;
        }
        return false;
    }
}

// Istanza globale del gestore Stripe Connect Rivenditori & Promoter
window.stripeConnectPromoter = new StripeConnectPromoterManager();
