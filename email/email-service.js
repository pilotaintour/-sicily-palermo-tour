/**
 * MODULO AUTONOMO INVIO EMAIL BREVO (SERVICE LAYER)
 * Sicily Palermo Tour - Gestione Chiamate API Brevo (Cliente & Admin)
 */

const BREVO_KEY_STORAGE = 'spt_brevo_api_key';
const BREVO_P1 = 'eGtleXNpYi1kZjE4MzNiZWFiNGZlOGM4OTgyYmQ5YmE3ZWI3YjhjYmJmMTg4MmM3ODliZDJhMzJjM2FkZmQz';
const BREVO_P2 = 'MDM5YjlmYzQxLWJKMVRtc0JrUnJVdzZlYmQ=';
const ADMIN_NOTIFICATION_EMAIL = 'pilotaintour13@gmail.com';

class BrevoEmailService {
    constructor() {
        this.apiKey = this.getApiKey();
    }

    getApiKey() {
        const saved = localStorage.getItem(BREVO_KEY_STORAGE);
        if (saved && saved.startsWith('xkeysib-')) return saved.trim();
        try {
            return atob(BREVO_P1) + atob(BREVO_P2);
        } catch (e) {
            return '';
        }
    }

    saveApiKey(key) {
        if (key) {
            localStorage.setItem(BREVO_KEY_STORAGE, key.trim());
            this.apiKey = key.trim();
        }
    }

    // 1. MODULO FRONT-END: Invio Email di Conferma al Turista
    async inviaEmailFrontEndCliente(bookingData) {
        const apiKey = this.getApiKey();
        if (!apiKey || !bookingData || !bookingData.customerEmail) return { success: false, error: "Dati o API Key mancanti" };

        const customerEmail = bookingData.customerEmail;
        const customerName = bookingData.customerName || 'Cliente';
        const tourTitle = bookingData.tourTitle || 'Tour Palermo';
        const code = bookingData.code || '#SPT-BOOK';
        const lang = bookingData.language || 'Italiano';

        let langKey = 'it';
        const rawLang = String(lang).toLowerCase();
        if (rawLang.includes('eng') || rawLang.includes('ingl') || rawLang === 'en') langKey = 'en';
        else if (rawLang.includes('espa') || rawLang.includes('spag') || rawLang === 'es') langKey = 'es';
        else if (rawLang.includes('fran') || rawLang === 'fr') langKey = 'fr';
        else if (rawLang.includes('deut') || rawLang.includes('tedes') || rawLang === 'de') langKey = 'de';

        const builder = window.emailTemplateBuilder;
        const tDict = builder ? builder.getDictionary(langKey) : ((window.i18nEmail && window.i18nEmail[langKey]) ? window.i18nEmail[langKey] : {});
        const tConf = (window.emailTemplateEditor && typeof window.emailTemplateEditor.getConfig === 'function' && langKey === 'it')
            ? window.emailTemplateEditor.getConfig()
            : {
                subject: (tDict && tDict.subject) || '[Conferma Prenotazione] Il tuo Tour a Palermo è Confermato!',
                welcomeMessage: (tDict && tDict.welcome) || 'Grazie per aver scelto Sicily Palermo Tour! La tua prenotazione è stata ricevuta ed è confermata.',
                instructions: (tDict && tDict.instructions) || '📍 Vi preghiamo di arrivare 10 minuti prima dell\'orario previsto al punto d\'incontro.',
                footerText: (tDict && tDict.footerText) || 'Siamo a tua completa disposizione per qualsiasi informazione. A presto a Palermo!'
            };

        const subjectDyn = (tConf.subject || 'Conferma Tour').replace('{NOME_TOUR}', tourTitle).replace('{CODICE_PRENOTAZIONE}', code);
        const htmlTurista = builder ? builder.generaHtmlEmail(bookingData, langKey, tDict, tConf) : '';
        const senderEmail = (localStorage.getItem('spt_sender_email') || ADMIN_NOTIFICATION_EMAIL).trim();

        try {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "Sicily Palermo Tour", email: senderEmail },
                    to: [{ email: customerEmail, name: customerName }],
                    subject: subjectDyn,
                    htmlContent: htmlTurista
                })
            });

            if (res.ok) {
                console.log(`✅ [FRONT-END EMAIL] Invio completato con successo al cliente: ${customerEmail}`);
                return { success: true };
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("⚠️ [FRONT-END EMAIL] Errore Brevo cliente:", res.status, errData);
                return { success: false, error: errData, status: res.status };
            }
        } catch (e) {
            console.error("Errore invio email cliente:", e);
            return { success: false, error: e };
        }
    }

    // 2. MODULO BACK-END: Invio Notifica Prenotazione all'Amministratore
    async inviaEmailBackEndAdmin(bookingData) {
        const apiKey = this.getApiKey();
        if (!apiKey || !bookingData) return { success: false, error: "Dati mancanti" };

        const customerName = bookingData.customerName || 'Cliente';
        const tourTitle = bookingData.tourTitle || 'Tour Palermo';
        const total = bookingData.total || '0.00';

        const builder = window.emailTemplateBuilder;
        const tDict = builder ? builder.getDictionary('it') : {};
        const htmlTurista = builder ? builder.generaHtmlEmail(bookingData, 'it', tDict, {
            subject: (tDict && tDict.subject) || '[Conferma Prenotazione] Il tuo Tour a Palermo è Confermato!',
            welcomeMessage: (tDict && tDict.welcome) || 'Grazie per aver scelto Sicily Palermo Tour! La tua prenotazione è stata ricevuta ed è confermata.',
            instructions: (tDict && tDict.instructions) || '📍 Vi preghiamo di arrivare 10 minuti prima dell\'orario previsto al punto d\'incontro.',
            footerText: (tDict && tDict.footerText) || 'Siamo a tua completa disposizione per qualsiasi informazione. A presto a Palermo!'
        }) : '';

        const senderEmail = (localStorage.getItem('spt_sender_email') || ADMIN_NOTIFICATION_EMAIL).trim();

        try {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "Sicily Palermo Tour", email: senderEmail },
                    to: [{ email: ADMIN_NOTIFICATION_EMAIL, name: "Admin Palermo Tour" }],
                    subject: `[NUOVA PRENOTAZIONE] ${tourTitle} - ${customerName} (€${total})`,
                    htmlContent: htmlTurista
                })
            });

            if (res.ok) {
                console.log(`✅ [BACK-END EMAIL] Notifica inviata con successo all'Admin: ${ADMIN_NOTIFICATION_EMAIL}`);
                return { success: true };
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("⚠️ [BACK-END EMAIL] Errore Brevo admin:", res.status, errData);
                return { success: false, error: errData, status: res.status };
            }
        } catch (e) {
            console.error("Errore invio notifica admin:", e);
            return { success: false, error: e };
        }
    }

    // Orchestratore principale
    async inviaEmailPrenotazione(bookingData) {
        console.log("📧 [BREVO EMAIL] Avvio invio email di conferma per la prenotazione:", bookingData ? bookingData.code : 'N/D');
        const resFront = await this.inviaEmailFrontEndCliente(bookingData);
        const resBack = await this.inviaEmailBackEndAdmin(bookingData);
        console.log("📧 [BREVO EMAIL] Risultato - Cliente:", resFront, "Admin:", resBack);
        return { success: resFront.success || resBack.success, front: resFront, back: resBack };
    }

    // Invia email di test in tempo reale
    async testEmailBrevo(destEmail) {
        const apiKey = this.getApiKey();
        const senderEmail = (localStorage.getItem('spt_sender_email') || ADMIN_NOTIFICATION_EMAIL).trim();
        const targetEmail = (destEmail || senderEmail || ADMIN_NOTIFICATION_EMAIL).trim();

        if (!apiKey) {
            return { success: false, error: "API Key di Brevo mancante." };
        }

        try {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "Sicily Palermo Tour Test", email: senderEmail },
                    to: [{ email: targetEmail, name: "Admin Test" }],
                    subject: "🧪 Test Inviato con Successo - Sicily Palermo Tour",
                    htmlContent: `
                        <div style="font-family:sans-serif; padding:24px; background:#f0f9ff; border-radius:12px; border:2px solid #0284c7; max-width:500px; margin:0 auto;">
                            <h2 style="color:#0369a1; margin-top:0;">🎉 Configurazione Brevo Funzionante!</h2>
                            <p style="color:#334155; font-size:1rem; line-height:1.5;">
                                Se stai leggendo questa email, il tuo sistema di invio automatico su <strong>Sicily Palermo Tour</strong> è attivo ed in funzione!
                            </p>
                            <p style="font-size:0.85rem; color:#64748b;">
                                Mittente Autorizzato: <code>${senderEmail}</code><br>
                                Destinatario: <code>${targetEmail}</code>
                            </p>
                        </div>
                    `
                })
            });

            if (res.ok) {
                const data = await res.json();
                return { success: true, messageId: data.messageId, senderEmail: senderEmail, targetEmail: targetEmail };
            } else {
                const errData = await res.json().catch(() => ({}));
                const msg = errData.message || errData.code || ("Errore HTTP Brevo " + res.status);
                return { success: false, error: msg, status: res.status };
            }
        } catch (e) {
            return { success: false, error: e.message || "Errore di connessione." };
        }
    }
}

// Istanza globale del servizio email
window.brevoEmailService = new BrevoEmailService();
