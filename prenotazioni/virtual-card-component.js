/**
 * MODULO CARTA DI CREDITO: VISTA UNICA SULLA FACCIATA PRINCIPALE (CONCISA E AD ALTO CONTRASTO)
 * Sicily Palermo Tour - Tutti i campi (Numero, Intestatario, Scadenza, CVC) in un'unica facciata leggibile
 */

class VirtualCardComponent {
    constructor() {
        this.containerId = null;
        this.isFlipped = false;
    }

    render(containerId) {
        this.containerId = containerId;
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div class="vcard-wrapper-main">
                <style>
                    .vcard-single-front {
                        background: linear-gradient(135deg, #0b2545 0%, #1e293b 50%, #0f172a 100%);
                        border-radius: 20px;
                        padding: 24px;
                        color: #ffffff;
                        box-shadow: 0 16px 36px rgba(15, 23, 42, 0.35);
                        border: 1px solid rgba(255, 255, 255, 0.18);
                        max-width: 500px;
                        margin: 0 auto 18px auto;
                        box-sizing: border-box;
                    }

                    .vcard-input-field {
                        background: #ffffff !important;
                        border: 1.5px solid #cbd5e1 !important;
                        border-radius: 10px !important;
                        color: #0f172a !important;
                        -webkit-text-fill-color: #0f172a !important;
                        font-family: monospace, sans-serif !important;
                        font-weight: 700 !important;
                        font-size: 1.05rem !important;
                        padding: 10px 12px !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                        outline: none !important;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.06) !important;
                        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
                    }

                    .vcard-input-field:focus {
                        border-color: #38bdf8 !important;
                        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.4) !important;
                        background: #ffffff !important;
                    }

                    .vcard-input-field::placeholder {
                        color: #94a3b8 !important;
                        -webkit-text-fill-color: #94a3b8 !important;
                        opacity: 1 !important;
                    }

                    .vcard-input-field:-webkit-autofill,
                    .vcard-input-field:-webkit-autofill:hover,
                    .vcard-input-field:-webkit-autofill:focus,
                    .vcard-input-field:-webkit-autofill:active {
                        -webkit-box-shadow: 0 0 0 100px #ffffff inset !important;
                        -webkit-text-fill-color: #0f172a !important;
                        color: #0f172a !important;
                        transition: background-color 50000s ease-in-out 0s !important;
                    }
                </style>

                <!-- Box Selettore Opzioni Pagamento -->
                <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 18px; padding: 24px; margin-top: 20px; box-shadow: 0 8px 24px rgba(11, 37, 69, 0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
                        <label style="font-weight: 800; color: #0b2545; font-size: 1.15rem; display: flex; align-items: center; gap: 8px; margin: 0;">
                            <span>💳</span> Metodo di Pagamento Sicuro
                        </label>
                        <span style="font-size: 0.8rem; font-weight: 700; color: #166534; background: #dcfce7; padding: 4px 12px; border-radius: 20px; border: 1px solid #bbf7d0;">
                            🔒 Crittografia SSL 256-bit
                        </span>
                    </div>

                    <!-- Selettore Carta / PayPal -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 24px;">
                        <label id="opt-label-card" onclick="window.virtualCardComponent.selezionaMetodo('card')" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border: 2px solid #0b2545; border-radius: 14px; cursor: pointer; background: #f0f9ff; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(11, 37, 69, 0.08);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <input type="radio" name="payment_method" value="card" checked style="accent-color: #0b2545; width: 20px; height: 20px; cursor: pointer;">
                                <div>
                                    <strong style="color: #0b2545; font-size: 1rem; display: block;">Carta di Credito / Debito</strong>
                                    <span style="font-size: 0.8rem; color: #64748b;">Visa, MasterCard, Amex, Postepay</span>
                                </div>
                            </div>
                            <div style="font-size: 1.3rem;">💳</div>
                        </label>

                        <label id="opt-label-paypal" onclick="window.virtualCardComponent.selezionaMetodo('paypal')" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border: 1.5px solid #cbd5e1; border-radius: 14px; cursor: pointer; background: #ffffff; transition: all 0.2s ease;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <input type="radio" name="payment_method" value="paypal" style="accent-color: #0070ba; width: 20px; height: 20px; cursor: pointer;">
                                <div>
                                    <strong style="color: #003087; font-size: 1rem; display: block;">PayPal</strong>
                                    <span style="font-size: 0.8rem; color: #64748b;">Conto PayPal o carta associata</span>
                                </div>
                            </div>
                            <div style="font-weight: 900; color: #0070ba; font-style: italic; font-size: 1.2rem;">PayPal</div>
                        </label>
                    </div>

                    <!-- CONTENITORE CARTA DI CREDITO (UNICA FACCIATA PRINCIPALE) -->
                    <div id="box-metodo-card" style="display: block; background: #fafcfd; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 22px;">

                        <div class="vcard-single-front">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div class="virtual-card-chip" style="width: 44px; height: 32px; background: linear-gradient(135deg, #fef08a 0%, #d97706 100%); border-radius: 6px; box-shadow: inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.2);"></div>
                                    <span style="font-size: 1.1rem; opacity: 0.9;">📶</span>
                                </div>
                                <div style="font-weight: 800; font-size: 0.82rem; letter-spacing: 1px; color: #93c5fd; text-transform: uppercase;">
                                    Carta di Credito / Debito
                                </div>
                            </div>

                            <!-- NUMERO CARTA -->
                            <div style="margin-bottom: 16px;">
                                <label style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.5px; color: #cbd5e1; font-weight: 700; display: block; margin-bottom: 6px;">💳 NUMERO CARTA *</label>
                                <input type="text" id="vcard-number-input" class="vcard-input-field" placeholder="4242 4242 4242 4242" maxlength="19" autocomplete="cc-number">
                            </div>

                            <!-- INTESTATARIO, SCADENZA, CVC TUTTI SULLA FRONTE -->
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; align-items: flex-end;">
                                <div>
                                    <label style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.5px; color: #cbd5e1; font-weight: 700; display: block; margin-bottom: 6px;">👤 INTESTATARIO *</label>
                                    <input type="text" id="vcard-name-input" class="vcard-input-field" placeholder="MARIO ROSSI" style="text-transform: uppercase;" autocomplete="cc-name">
                                </div>
                                <div>
                                    <label style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.5px; color: #cbd5e1; font-weight: 700; display: block; margin-bottom: 6px;">⏳ SCADENZA *</label>
                                    <input type="text" id="vcard-expiry-input" class="vcard-input-field" placeholder="12/28" maxlength="5" autocomplete="cc-exp">
                                </div>
                                <div>
                                    <label style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.5px; color: #cbd5e1; font-weight: 700; display: block; margin-bottom: 6px;">🔒 CVC / CVV *</label>
                                    <input type="text" id="vcard-cvc-input" class="vcard-input-field" placeholder="123" maxlength="4" style="text-align: center;" autocomplete="cc-csc">
                                </div>
                            </div>
                        </div>

                        <p style="font-size: 0.83rem; color: #64748b; margin-top: 12px; margin-bottom: 0; line-height: 1.4;">
                            🔒 L'importo verrà <strong>solo prenotato in sospeso</strong> (Pre-Autorizzazione) a garanzia del tour. Nessun addebito definitivo fino alla conferma!
                        </p>

                        <!-- Div Errore -->
                        <div id="stripe-card-errors" role="alert" style="color: #dc2626; font-size: 0.88rem; margin-top: 12px; font-weight: 700; display: none; background: #fef2f2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 8px;"></div>
                    </div>

                    <!-- BOX PAYPAL SMART BUTTONS -->
                    <div id="box-metodo-paypal" style="display: none; background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 16px; padding: 26px; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 6px;">🔵</div>
                        <strong style="font-size: 1.1rem; color: #003087; display: block; margin-bottom: 6px;">Pagamento Sicuro con PayPal</strong>
                        <p style="font-size: 0.9rem; color: #0369a1; margin: 0 0 18px 0; line-height: 1.5;">
                            Accedi in totale sicurezza al tuo conto PayPal per autorizzare il pagamento:
                        </p>
                        <div id="paypal-smart-button-container" style="max-width: 340px; margin: 0 auto; min-height: 50px;"></div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEvents();
    }

    attachEvents() {
        const numEl = document.getElementById('vcard-number-input');
        const expEl = document.getElementById('vcard-expiry-input');
        const cvcEl = document.getElementById('vcard-cvc-input');
        const nameEl = document.getElementById('vcard-name-input');

        const syncLegacy = () => {
            const numLegacy = document.getElementById('stripe-card-number-fallback');
            const expLegacy = document.getElementById('stripe-card-expiry-fallback');
            const cvcLegacy = document.getElementById('stripe-card-cvc-fallback');
            const nameLegacy = document.getElementById('stripe-cardholder-name');

            if (numLegacy && numEl) numLegacy.value = numEl.value;
            if (expLegacy && expEl) expLegacy.value = expEl.value;
            if (cvcLegacy && cvcEl) cvcLegacy.value = cvcEl.value;
            if (nameLegacy && nameEl) nameLegacy.value = nameEl.value;
        };

        if (numEl) {
            numEl.addEventListener('input', (e) => {
                let digits = e.target.value.replace(/\D/g, '').substring(0, 16);
                let formatted = digits.replace(/(.{4})/g, '$1 ').trim();
                e.target.value = formatted;
                syncLegacy();
            });
        }

        if (expEl) {
            expEl.addEventListener('input', (e) => {
                let digits = e.target.value.replace(/\D/g, '').substring(0, 4);
                if (digits.length >= 3) {
                    e.target.value = digits.substring(0, 2) + '/' + digits.substring(2);
                } else {
                    e.target.value = digits;
                }
                syncLegacy();
            });
        }

        if (cvcEl) {
            cvcEl.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
                syncLegacy();
            });
        }

        if (nameEl) {
            nameEl.addEventListener('input', () => syncLegacy());
        }
    }

    flipCard() {
        return;
    }

    selezionaMetodo(tipo) {
        const boxCard = document.getElementById('box-metodo-card');
        const boxPaypal = document.getElementById('box-metodo-paypal');
        const labelCard = document.getElementById('opt-label-card');
        const labelPaypal = document.getElementById('opt-label-paypal');

        const radioCard = document.querySelector('input[name="payment_method"][value="card"]');
        const radioPaypal = document.querySelector('input[name="payment_method"][value="paypal"]');

        if (tipo === 'card') {
            if (radioCard) radioCard.checked = true;
            if (radioPaypal) radioPaypal.checked = false;
            if (boxCard) boxCard.style.display = 'block';
            if (boxPaypal) boxPaypal.style.display = 'none';
            if (labelCard) {
                labelCard.style.border = '2px solid #0b2545';
                labelCard.style.background = '#f0f9ff';
            }
            if (labelPaypal) {
                labelPaypal.style.border = '1.5px solid #cbd5e1';
                labelPaypal.style.background = '#ffffff';
            }
        } else {
            if (radioCard) radioCard.checked = false;
            if (radioPaypal) radioPaypal.checked = true;
            if (boxCard) boxCard.style.display = 'none';
            if (boxPaypal) boxPaypal.style.display = 'block';
            if (labelCard) {
                labelCard.style.border = '1.5px solid #cbd5e1';
                labelCard.style.background = '#ffffff';
            }
            if (labelPaypal) {
                labelPaypal.style.border = '2px solid #0070ba';
                labelPaypal.style.background = '#f0f9ff';
            }

            if (window.stripeClientCheckout && typeof window.stripeClientCheckout.renderPayPalSmartButtons === 'function') {
                window.stripeClientCheckout.renderPayPalSmartButtons();
            } else if (window.stripePayment && typeof window.stripePayment.renderPayPalSmartButtons === 'function') {
                window.stripePayment.renderPayPalSmartButtons();
            }
        }
    }

    autoCompilaTestCard() {
        const numEl = document.getElementById('vcard-number-input');
        const nameEl = document.getElementById('vcard-name-input');
        const expEl = document.getElementById('vcard-expiry-input');
        const cvcEl = document.getElementById('vcard-cvc-input');

        if (numEl) numEl.value = "4242 4242 4242 4242";
        if (nameEl) nameEl.value = "MARIO ROSSI";
        if (expEl) expEl.value = "12/28";
        if (cvcEl) cvcEl.value = "123";

        const numLegacy = document.getElementById('stripe-card-number-fallback');
        const expLegacy = document.getElementById('stripe-card-expiry-fallback');
        const cvcLegacy = document.getElementById('stripe-card-cvc-fallback');
        const nameLegacy = document.getElementById('stripe-cardholder-name');

        if (numLegacy) numLegacy.value = "4242 4242 4242 4242";
        if (expLegacy) expLegacy.value = "12/28";
        if (cvcLegacy) cvcLegacy.value = "123";
        if (nameLegacy) nameLegacy.value = "MARIO ROSSI";

        alert("🧪 Carta di Test Autocompilata con Successo!\n\n• Numero: 4242 4242 4242 4242\n• Intestatario: MARIO ROSSI\n• Scadenza: 12/28\n• CVC: 123");
    }

    getValues() {
        const numEl = document.getElementById('vcard-number-input') || document.getElementById('stripe-card-number-fallback');
        const nameEl = document.getElementById('vcard-name-input') || document.getElementById('stripe-cardholder-name');
        const expEl = document.getElementById('vcard-expiry-input') || document.getElementById('stripe-card-expiry-fallback');
        const cvcEl = document.getElementById('vcard-cvc-input') || document.getElementById('stripe-card-cvc-fallback');

        return {
            cardNumber: numEl ? numEl.value.replace(/\s+/g, '') : '',
            cardholderName: nameEl ? nameEl.value.trim() : 'MARIO ROSSI',
            cardExpiry: expEl ? expEl.value.trim() : '',
            cardCvc: cvcEl ? cvcEl.value.trim() : ''
        };
    }
}

// Istanza Globale Componente Carta
window.virtualCardComponent = new VirtualCardComponent();
