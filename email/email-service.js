/**
 * MODULO AUTONOMO INVIO EMAIL AUTOMATICHE BREVO (ex Sendinblue) - MULTILINGUA (IT, EN, ES, FR, DE)
 * Sicily Palermo Tour - Riconoscimento Automatico Lingua e Invio Conferma Personalizzata
 */

const BREVO_KEY_STORAGE = 'spt_brevo_api_key';
const BREVO_P1 = 'eGtleXNpYi1kZjE4MzNiZWFiNGZlOGM4OTgyYmQ5YmE3ZWI3YjhjYmJmMTg4MmM3ODliZDJhMzJjM2FkZmQz';
const BREVO_P2 = 'MDM5YjlmYzQxLWJKMVRtc0JrUnJVdzZlYmQ=';
const ADMIN_NOTIFICATION_EMAIL = 'pilotaintour13@gmail.com';

// Dizionario Multilingua Completo per l'Email di Conferma Turisti
const i18nEmail = {
    it: {
        badgeSuccess: "PRENOTAZIONE REGISTRATA CON SUCCESSO",
        subject: "[Conferma Prenotazione] Il tuo Tour a Palermo è Confermato!",
        welcome: "Grazie per aver scelto Sicily Palermo Tour! La tua prenotazione è stata ricevuta ed è confermata.",
        codeLabel: "Codice Prenotazione:",
        transLabel: "Riferimento Transazione (Stripe / PayPal):",
        tourLabel: "📍 Tour:",
        langLabel: "🌐 Lingua Guida:",
        dateLabel: "📅 Data della Visita:",
        timeLabel: "⏰ Orario Partenza:",
        guestsLabel: "👥 Partecipanti:",
        contactLabel: "👤 Referente:",
        addressLabel: "🏠 Residenza / Fatturazione:",
        adults: "Adulti",
        children: "Bambini",
        totalLabel: "Totale in Pre-Autorizzazione:",
        instructionsTitle: "🎒 Istruzioni & Raccomandazioni Tour:",
        instructions: "📍 Vi preghiamo di arrivare 10 minuti prima dell'orario previsto al punto d'incontro. Consigliamo scarpe comode e macchina fotografica.",
        helpTitle: "💬 Hai domande o bisogno di assistenza in privato?",
        helpText: "Se hai qualsiasi dubbio, comunica all'amministratore il tuo **Codice** oppure il **Riferimento Transazione**:",
        helpBtn: "💬 Contatta l'Admin su WhatsApp (+39 340 1234567)",
        footerText: "Siamo a tua completa disposizione per qualsiasi informazione o esigenza particolare. A presto a Palermo!",
        subFooter: "Sicily Palermo Tour - La tua guida speciale a Palermo"
    },
    en: {
        badgeSuccess: "BOOKING SUCCESSFULLY REGISTERED",
        subject: "[Booking Confirmation] Your Tour in Palermo is Confirmed!",
        welcome: "Thank you for choosing Sicily Palermo Tour! Your booking has been received and confirmed.",
        codeLabel: "Booking Code:",
        transLabel: "Transaction Reference (Stripe / PayPal):",
        tourLabel: "📍 Tour:",
        langLabel: "🌐 Tour Language:",
        dateLabel: "📅 Date of Visit:",
        timeLabel: "⏰ Departure Time:",
        guestsLabel: "👥 Participants:",
        contactLabel: "👤 Lead Contact:",
        addressLabel: "🏠 Billing Address / Residence:",
        adults: "Adults",
        children: "Children",
        totalLabel: "Total Pre-Authorized Amount:",
        instructionsTitle: "🎒 Tour Instructions & Recommendations:",
        instructions: "📍 Please arrive 10 minutes before the scheduled time at the meeting point. Comfortable walking shoes and camera recommended.",
        helpTitle: "💬 Do you have questions or need assistance?",
        helpText: "If you have any questions, provide the administrator with your **Booking Code** or **Transaction Reference**:",
        helpBtn: "💬 Contact Admin on WhatsApp (+39 340 1234567)",
        footerText: "We are at your complete disposal for any information or special requirements. See you soon in Palermo!",
        subFooter: "Sicily Palermo Tour - Your special guide in Palermo"
    },
    es: {
        badgeSuccess: "RESERVA REGISTRADA CON ÉXITO",
        subject: "[Confirmación de Reserva] ¡Tu Tour en Palermo está Confirmado!",
        welcome: "¡Gracias por elegir Sicily Palermo Tour! Tu reserva ha sido recibida y confirmada.",
        codeLabel: "Código de Reserva:",
        transLabel: "Referencia de Transacción (Stripe / PayPal):",
        tourLabel: "📍 Tour:",
        langLabel: "🌐 Idioma del Tour:",
        dateLabel: "📅 Fecha de la Visita:",
        timeLabel: "⏰ Hora de Salida:",
        guestsLabel: "👥 Participantes:",
        contactLabel: "👤 Persona de Contacto:",
        addressLabel: "🏠 Dirección de Facturación / Residencia:",
        adults: "Adultos",
        children: "Niños",
        totalLabel: "Monto Total Preautorizado:",
        instructionsTitle: "🎒 Instrucciones y Recomendaciones del Tour:",
        instructions: "📍 Por favor llegue 10 minutos antes de la hora programada al punto de encuentro. Se recomiendan zapatos cómodos y cámara.",
        helpTitle: "💬 ¿Tienes preguntas o necesitas asistencia?",
        helpText: "Si tienes alguna duda, comunica al administrador tu **Código de Reserva** o **Referencia de Transacción**:",
        helpBtn: "💬 Contactar por WhatsApp (+39 340 1234567)",
        footerText: "Estamos a tu entera disposición para cualquier información o necesidad especial. ¡Hasta pronto en Palermo!",
        subFooter: "Sicily Palermo Tour - Tu guía especial en Palermo"
    },
    fr: {
        badgeSuccess: "RÉSERVATION ENREGISTRÉE AVEC SUCCÈS",
        subject: "[Confirmation de Réservation] Votre Visite à Palerme est Confirmée!",
        welcome: "Merci d'avoir choisi Sicily Palermo Tour! Votre réservation a été reçue et confirmée.",
        codeLabel: "Code de Réservation:",
        transLabel: "Référence de Transaction (Stripe / PayPal):",
        tourLabel: "📍 Visite:",
        langLabel: "🌐 Langue de la Visite:",
        dateLabel: "📅 Date de Visite:",
        timeLabel: "⏰ Heure de Départ:",
        guestsLabel: "👥 Participants:",
        contactLabel: "👤 Contact Principal:",
        addressLabel: "🏠 Adresse de Facturation / Résidence:",
        adults: "Adultes",
        children: "Enfants",
        totalLabel: "Montant Total Pré-Autorisé:",
        instructionsTitle: "🎒 Instructions et Recommandations pour la Visite:",
        instructions: "📍 Veuillez arriver 10 minutes avant l'heure prévue au point de rendez-vous. Chaussures confortables et appareil photo recommandés.",
        helpTitle: "💬 Vous avez des questions ou besoin d'assistance?",
        helpText: "Si vous avez des questions, communiquez à l'administrateur votre **Code de Réservation** ou **Référence de Transaction**:",
        helpBtn: "💬 Contacter l'Admin sur WhatsApp (+39 340 1234567)",
        footerText: "Nous sommes à votre entière disposition pour toute information ou besoin particulier. À bientôt à Palerme!",
        subFooter: "Sicily Palermo Tour - Votre guide spécial à Palerme"
    },
    de: {
        badgeSuccess: "BUCHUNG ERFOLGREICH REGISTRIERT",
        subject: "[Buchungsbestätigung] Ihre Tour in Palermo ist Bestätigt!",
        welcome: "Vielen Dank, dass Sie sich für Sicily Palermo Tour entschieden haben! Ihre Buchung wurde bestätigt.",
        codeLabel: "Buchungscode:",
        transLabel: "Transaktionsreferenz (Stripe / PayPal):",
        tourLabel: "📍 Tour:",
        langLabel: "🌐 Führungssprache:",
        dateLabel: "📅 Datum des Besuchs:",
        timeLabel: "⏰ Abfahrtszeit:",
        guestsLabel: "👥 Teilnehmer:",
        contactLabel: "👤 Ansprechpartner:",
        addressLabel: "🏠 Rechnungsadresse / Wohnsitz:",
        adults: "Erwachsene",
        children: "Kinder",
        totalLabel: "Vorautorisierter Gesamtbetrag:",
        instructionsTitle: "🎒 Anweisungen & Empfehlungen zur Tour:",
        instructions: "📍 Bitte finden Sie sich 10 Minuten vor der vereinbarten Zeit am Treffpunkt ein. Bequeme Schuhe und Kamera empfohlen.",
        helpTitle: "💬 Haben Sie Fragen oder benötigen Sie Hilfe?",
        helpText: "Bei Fragen nennen Sie dem Administrator bitte Ihren **Buchungscode** oder Ihre **Transaktionsreferenz**:",
        helpBtn: "💬 Admin über WhatsApp kontaktieren (+39 340 1234567)",
        footerText: "Wir stehen Ihnen für weitere Informationen gerne zur Verfügung. Bis bald in Palermo!",
        subFooter: "Sicily Palermo Tour - Ihr besonderer Reiseführer in Palermo"
    }
};

class BrevoEmailService {
    constructor() {
        this.apiKey = this.getApiKey();
    }

    getApiKey() {
        const saved = localStorage.getItem(BREVO_KEY_STORAGE);
        if (saved) return saved;
        try {
            return atob(BREVO_P1 + BREVO_P2);
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

    // Invia un messaggio dal Form Contatti direttamente alla casella dell'amministratore ed invia conferma al cliente
    async inviaEmailMessaggioContatto(nome, emailCliente, messaggio) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.log("Nessuna API Key Brevo configurata.");
            return { success: false, reason: "API Key mancante" };
        }

        const waNum = (localStorage.getItem('spt_wa_number') || '393401234567').replace(/[^0-9]/g, '');

        const htmlContattoAdmin = `
            <!DOCTYPE html>
            <html lang="it">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; padding:15px; color:#1e293b; background:#f8fafc; margin:0;">
                <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; padding:24px; border:1px solid #cbd5e1; box-sizing:border-box; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <div style="text-align:center; margin-bottom:18px;">
                        <img src="https://pilotaintour.github.io/-sicilypalermotour/logo.svg" alt="Sicily Palermo Tour" width="220" style="max-width:220px; width:100%; height:auto; display:block; margin:0 auto 10px auto;">
                        <h2 style="color:#0b2545; margin:0; font-size:1.3rem;">📩 Nuovo Messaggio dal Form Contatti</h2>
                    </div>
                    <p style="font-size:0.95rem;"><strong>Nome Mittente:</strong> ${nome}</p>
                    <p style="font-size:0.95rem;"><strong>Email Cliente:</strong> <a href="mailto:${emailCliente}" style="color:#0369a1; word-break:break-all;">${emailCliente}</a></p>
                    <hr style="border:none; border-top:1px solid #cbd5e1; margin:15px 0;">
                    <p style="font-size:0.95rem;"><strong>Messaggio:</strong></p>
                    <blockquote style="background:#f1f5f9; padding:14px 18px; border-left:4px solid #0b2545; border-radius:8px; margin:0; font-style:italic; font-size:0.92rem; color:#334155; word-break:break-word;">
                        "${messaggio}"
                    </blockquote>
                    <hr style="border:none; border-top:1px solid #cbd5e1; margin:20px 0 15px 0;">
                    <p style="font-size:0.85rem; color:#64748b; text-align:center;">Puoi rispondere direttamente al cliente a questa email: ${emailCliente}</p>
                </div>
            </body>
            </html>
        `;

        const htmlCopiaCortesiaCliente = `
            <!DOCTYPE html>
            <html lang="it">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; padding:15px; color:#1e293b; background:#f8fafc; margin:0;">
                <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 6px 18px rgba(0,0,0,0.05); box-sizing:border-box;">
                    <div style="background:linear-gradient(135deg, #0b2545, #134074); padding:26px 20px; text-align:center; color:#ffffff; border-bottom:3px solid #d97706;">
                        <img src="https://pilotaintour.github.io/-sicilypalermotour/logo.svg" alt="Sicily Palermo Tour" width="240" style="max-width:240px; width:100%; height:auto; display:block; margin:0 auto 10px auto; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));">
                        <p style="margin:4px 0 0 0; font-size:0.9rem; opacity:0.9; font-weight:600;">Messaggio Ricevuto con Successo</p>
                    </div>
                    <div style="padding:24px;">
                        <h3 style="color:#0b2545; margin-top:0; font-size:1.2rem;">Ciao ${nome}!</h3>
                        <p style="font-size:0.95rem; color:#475569; line-height:1.6;">
                            Grazie per averci contattato! Abbiamo ricevuto il tuo messaggio e un nostro operatore ti risponderà al più presto.
                        </p>
                        <div style="background:#f1f5f9; padding:14px 18px; border-left:4px solid #0b2545; border-radius:8px; margin:18px 0; font-style:italic; font-size:0.9rem; color:#334155; word-break:break-word;">
                            Riepilogo del tuo messaggio:<br>
                            "${messaggio}"
                        </div>
                        <p style="font-size:0.9rem; color:#64748b; line-height:1.5;">
                            Per richieste urgenti o informazioni immediate sui nostri tour, puoi scriverci direttamente anche su WhatsApp.
                        </p>
                        <div style="margin-top:20px; text-align:center;">
                            <a href="https://wa.me/${waNum}" style="background:#25d366; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:10px; font-weight:bold; display:inline-block; font-size:0.92rem; box-shadow:0 4px 12px rgba(37,211,102,0.25);">💬 Scrivici in Privato su WhatsApp</a>
                        </div>
                    </div>
                    <div style="background:#f1f5f9; padding:14px; text-align:center; font-size:0.8rem; color:#64748b; border-top:1px solid #e2e8f0;">
                        Sicily Palermo Tour - La tua guida speciale a Palermo
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            // 1. Invia notifica all'Amministratore
            const resAdmin = fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: nome, email: ADMIN_NOTIFICATION_EMAIL },
                    to: [{ email: ADMIN_NOTIFICATION_EMAIL, name: "Admin Palermo Tour" }],
                    replyTo: { email: emailCliente, name: nome },
                    subject: `[Messaggio Contatti] Da ${nome} (${emailCliente})`,
                    htmlContent: htmlContattoAdmin
                })
            });

            // 2. Invia email automatica di cortesia al Cliente
            const resCustomer = fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "Sicily Palermo Tour", email: ADMIN_NOTIFICATION_EMAIL },
                    to: [{ email: emailCliente, name: nome }],
                    subject: `[Sicily Palermo Tour] Abbiamo ricevuto il tuo messaggio, ${nome}!`,
                    htmlContent: htmlCopiaCortesiaCliente
                })
            });

            await Promise.all([resAdmin, resCustomer]);
            return { success: true };
        } catch (e) {
            console.error("Errore invio messaggio contatti Brevo:", e);
        }
        return { success: false };
    }

    // Invia contemporaneamente l'email di conferma al turista e la notifica all'amministratore (Riconoscimento Automatico Lingua)
    async inviaEmailPrenotazione(bookingData) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.log("Nessuna API Key Brevo configurata. Email non inviata.");
            return { success: false, reason: "API Key mancante" };
        }

        const customerEmail = bookingData.customerEmail;
        const customerName = bookingData.customerName || 'Cliente';
        const code = bookingData.code || '#SPT-BOOK';
        const stripeRef = bookingData.paymentIntentId || 'pi_stripe_ref';
        const tourTitle = bookingData.tourTitle || 'Tour Palermo';
        const dateStr = bookingData.dateReadable || bookingData.dateISO || 'N/D';
        const timeStr = bookingData.slotTime || '09:30';
        const total = bookingData.total || '0.00';
        const phone = bookingData.customerPhone || 'N/D';
        const lang = bookingData.language || 'Italiano';
        const country = bookingData.country || 'Italia';
        const billingAddress = bookingData.billingAddress || 'N/D';
        const waNum = (localStorage.getItem('spt_wa_number') || '393401234567').replace(/[^0-9]/g, '');

        // Riconoscimento Lingua dell'utente (it, en, es, fr, de)
        let langKey = 'it';
        const rawLang = String(lang).toLowerCase();
        if (rawLang.includes('eng') || rawLang.includes('ingl') || rawLang === 'en') langKey = 'en';
        else if (rawLang.includes('espa') || rawLang.includes('spag') || rawLang === 'es') langKey = 'es';
        else if (rawLang.includes('fran') || rawLang === 'fr') langKey = 'fr';
        else if (rawLang.includes('deut') || rawLang.includes('tedes') || rawLang === 'de') langKey = 'de';

        const tDict = i18nEmail[langKey] || i18nEmail.it;

        // Recupera eventuale personalizzazione Admin se in Italiano, altrimenti usa il dizionario tradotto
        const tConf = (window.emailTemplateEditor && typeof window.emailTemplateEditor.getConfig === 'function' && langKey === 'it')
            ? window.emailTemplateEditor.getConfig()
            : {
                subject: tDict.subject,
                welcomeMessage: tDict.welcome,
                instructions: tDict.instructions,
                footerText: tDict.footerText
            };

        const subjectDyn = tConf.subject.replace('{NOME_TOUR}', tourTitle).replace('{CODICE_PRENOTAZIONE}', code);

        // Genera la lista dei partecipanti in formato HTML
        let partecipantiHtml = '';
        if (bookingData.participantsList && Array.isArray(bookingData.participantsList) && bookingData.participantsList.length > 0) {
            partecipantiHtml = `
                <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #cbd5e1;">
                    <strong style="color: #0b2545; display: block; margin-bottom: 6px; font-size: 0.92rem;">🧳 ${tDict.guestsLabel} (${bookingData.participantsList.length}):</strong>
                    <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: #334155; line-height: 1.6; word-break: break-word;">
                        ${bookingData.participantsList.map(p => `
                            <li style="margin-bottom: 4px;">
                                <strong>${p.name}</strong>
                                <span style="color: #64748b;">(${p.dob ? p.dob : p.type}${p.origin ? ' - ' + p.origin : ''})</span>
                                ${p.notes ? `<div style="font-size: 0.82rem; color: #475569;">📝 <em>Note: ${p.notes}</em></div>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // Email Multilingua Responsiva e Compatibile
        const htmlTurista = `
            <!DOCTYPE html>
            <html lang="${langKey}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                    table { border-collapse: collapse !important; }
                    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f7f9; }
                </style>
            </head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; background-color:#f4f7f9; margin:0; padding:20px 10px; color:#0f172a;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed; max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 10px 30px rgba(11,37,69,0.08);">

                    <!-- Header Banner con LOGO UFFICIALE in primo piano -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #0b2545 0%, #134074 100%); padding: 30px 20px; text-align: center; border-bottom: 3px solid #d97706;">
                            <a href="https://pilotaintour.github.io/-sicilypalermotour/" target="_blank" style="text-decoration: none; display: inline-block;">
                                <img src="https://pilotaintour.github.io/-sicilypalermotour/logo.svg" alt="Sicily Palermo Tour Logo" width="280" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto 12px auto; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));">
                            </a>
                            <div style="color: #ffffff; font-size: 1.15rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 4px;">
                                Sicily Palermo Tour
                            </div>
                            <div style="color: #fef3c7; font-size: 0.88rem; font-weight: 600; margin-top: 4px;">
                                ✨ ${tDict.badgeSuccess}
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding:28px 22px;">

                            <!-- Badge Spunta Verde di Conferma -->
                            <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px; text-align: center;">
                                <span style="font-size: 1.25rem;">✅</span>
                                <strong style="color: #166534; font-size: 0.98rem; margin-left: 6px;">${tDict.badgeSuccess}</strong>
                            </div>

                            <h2 style="color:#0b2545; margin-top:0; font-size:1.35rem; font-weight:800;">Hi ${customerName},</h2>
                            <p style="font-size:0.96rem; color:#475569; line-height:1.6; margin-bottom:20px;">
                                ${tConf.welcomeMessage}
                            </p>

                            <!-- BOX RIEPILOGO DATI E CODICI IDENTIFICATIVI -->
                            <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:14px; padding:20px; margin:20px 0; box-sizing:border-box;">

                                <!-- Codice Prenotazione -->
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
                                    <tr>
                                        <td style="color:#64748b; font-weight:bold; font-size:0.9rem; padding-bottom:4px;">${tDict.codeLabel}</td>
                                        <td align="right" style="font-weight:bold; font-size:1.1rem; color:#0369a1; font-family:monospace;">${code}</td>
                                    </tr>
                                </table>

                                <!-- Riferimento Transazione Bancaria -->
                                <div style="margin-bottom:14px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
                                    <div style="color:#64748b; font-weight:bold; font-size:0.88rem; margin-bottom:6px;">${tDict.transLabel}</div>
                                    <div style="background:#e0f2fe; border:1px solid #bae6fd; border-radius:8px; padding:8px 12px; font-family:monospace; font-size:0.85rem; color:#0b2545; font-weight:bold; word-break:break-all; word-wrap:break-word; overflow-wrap:break-word; display:block;">
                                        🔒 ${stripeRef}
                                    </div>
                                </div>

                                <!-- Dettagli Tour -->
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:0.92rem; color:#1e293b; line-height:1.7;">
                                    <tr><td style="padding:4px 0;"><strong>${tDict.tourLabel}</strong> ${tourTitle}</td></tr>
                                    <tr><td style="padding:4px 0;"><strong>📍 Punto di Ritrovo / Raccolta:</strong> <span style="color:#0369a1; font-weight:bold;">${bookingData.selectedPickup || 'Palermo Centro'}</span></td></tr>
                                    <tr><td style="padding:4px 0;"><strong>${tDict.langLabel}</strong> ${lang}</td></tr>
                                    <tr><td style="padding:4px 0;"><strong>${tDict.dateLabel}</strong> ${dateStr}</td></tr>
                                    <tr><td style="padding:4px 0;"><strong>${tDict.timeLabel}</strong> ${timeStr}</td></tr>
                                    <tr><td style="padding:4px 0;"><strong>${tDict.guestsLabel}</strong> ${bookingData.adults} ${tDict.adults}${bookingData.children > 0 ? `, ${bookingData.children} ${tDict.children}` : ''}</td></tr>
                                    <tr><td style="padding:4px 0;"><strong>${tDict.contactLabel}</strong> ${customerName} (${phone})</td></tr>
                                    <tr><td style="padding:4px 0; word-break:break-word;"><strong>${tDict.addressLabel}</strong> ${billingAddress} (${country})</td></tr>
                                </table>

                                ${partecipantiHtml}

                                <!-- Totale -->
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:14px; padding-top:12px; border-top:2px dashed #cbd5e1; font-size:1.15rem; font-weight:800; color:#0b2545;">
                                    <tr>
                                        <td>${tDict.totalLabel}</td>
                                        <td align="right" style="color:#0369a1; font-size:1.3rem;">€${total}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Istruzioni & Raccomandazioni -->
                            <div style="background:#fffbf5; border:1.5px solid #fed7aa; border-radius:12px; padding:16px; margin-bottom:20px; font-size:0.9rem; color:#9a3412; line-height:1.5;">
                                <strong style="display:block; margin-bottom:6px; font-size:0.95rem;">${tDict.instructionsTitle}</strong>
                                ${tConf.instructions}
                            </div>

                            <!-- Assistenza e WhatsApp -->
                            <div style="background:#f0f9ff; border:1.5px solid #bae6fd; border-radius:12px; padding:18px; margin-bottom:20px; text-align:center;">
                                <strong style="color:#0369a1; font-size:0.95rem; display:block; margin-bottom:6px;">${tDict.helpTitle}</strong>
                                <p style="font-size:0.88rem; color:#334155; margin:0 0 14px 0; line-height:1.5;">
                                    ${tDict.helpText}
                                </p>
                                <a href="https://wa.me/${waNum}" style="background:#25d366; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:10px; font-weight:bold; display:inline-block; font-size:0.92rem; box-shadow:0 4px 12px rgba(37,211,102,0.25);">
                                    ${tDict.helpBtn}
                                </a>
                            </div>

                            <p style="font-size:0.9rem; color:#64748b; line-height:1.5; margin-bottom:0;">
                                ${tConf.footerText}
                            </p>
                        </td>
                    </tr>

                    <!-- Footer Email -->
                    <tr>
                        <td align="center" style="background:#f1f5f9; padding:18px; font-size:0.8rem; color:#64748b; border-top:1px solid #e2e8f0; text-align:center;">
                            <strong>Sicily Palermo Tour</strong> - ${tDict.subFooter}<br>
                            <span style="font-size:0.75rem; color:#94a3b8; display:block; margin-top:4px;">&copy; 2025 Sicily Palermo Tour. All rights reserved.</span>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        try {
            // 1. Invio primario al Turista nella sua lingua
            const reqCustomer = fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "Sicily Palermo Tour", email: ADMIN_NOTIFICATION_EMAIL },
                    to: [{ email: customerEmail, name: customerName }],
                    subject: subjectDyn,
                    htmlContent: htmlTurista
                })
            }).catch(e => console.error("Errore invio Brevo Cliente:", e));

            // 2. Invio notifica istantanea all'Amministratore
            const reqAdmin = fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "Sicily Palermo Tour", email: ADMIN_NOTIFICATION_EMAIL },
                    to: [{ email: ADMIN_NOTIFICATION_EMAIL, name: "Admin Palermo Tour" }],
                    subject: `[NUOVA PRENOTAZIONE] ${tourTitle} - ${customerName} (€${total})`,
                    htmlContent: htmlTurista
                })
            }).catch(e => console.error("Errore invio Brevo Admin:", e));

            await Promise.all([reqCustomer, reqAdmin]);
            console.log(`Email multilingua (${langKey.toUpperCase()}) inviata con successo via Brevo a ${customerEmail}!`);
            return { success: true };
        } catch (e) {
            console.error("Errore generale invio email Brevo:", e);
            return { success: false, error: e };
        }
    }

    // Invia email all'utente quando viene eseguito un rimborso totale o parziale con penale (Collegato SOLO ai due pulsanti dedicati)
    async inviaEmailRimborsoPenale(booking, tipo, importoDettaglio) {
        const apiKey = this.getApiKey();
        if (!apiKey || !booking || !booking.customerEmail) return;

        const customerEmail = booking.customerEmail;
        const customerName = booking.customerName || 'Cliente';
        const code = booking.code || '#SPT-BOOK';
        const tourTitle = booking.tourTitle || 'Tour Palermo';
        const total = booking.total || '0.00';
        const waNum = (localStorage.getItem('spt_wa_number') || '393401234567').replace(/[^0-9]/g, '');

        let titoloEmail = '';
        let descrizioneEmail = '';

        if (tipo === 'RIMBORSO_100') {
            titoloEmail = `[Rimborso Confermato] La tua prenotazione ${code} è stata rimborsata al 100%`;
            descrizioneEmail = `Ti confermiamo che la pre-autorizzazione di <strong>€${total}</strong> per il tour <strong>${tourTitle}</strong> (Codice: ${code}) è stata <strong>completamente sbloccata/rimborsata al 100%</strong>. Questo rimborso è stato effettuato in conformità con i <strong>Termini e Condizioni e il Regolamento Penali di Cancellazione</strong> accettati al momento della prenotazione. L'importo tornerà disponibile sul tuo conto/carta secondo le tempistiche bancarie.`;
        } else {
            titoloEmail = `[Aggiornamento Prenotazione] Rimborso parziale e applicazione penale per ${code}`;
            descrizioneEmail = `Ti informiamo riguardo alla tua prenotazione per il tour <strong>${tourTitle}</strong> (Codice: ${code}). In conformità con i <strong>Termini e Condizioni e il Regolamento Penali di Cancellazione</strong> accettati al momento della prenotazione, è stata applicata una trattenuta penale di <strong>€${importoDettaglio}</strong> (su un totale di €${total}), e la rimanenza è stata regolarmente sbloccata/rilasciata sulla tua carta.`;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="it">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; padding:15px; color:#1e293b; background:#f8fafc; margin:0;">
                <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.05); box-sizing:border-box;">
                    <div style="background:linear-gradient(135deg, #0b2545, #134074); padding:24px 20px; text-align:center; color:#ffffff; border-bottom:3px solid #d97706;">
                        <img src="https://pilotaintour.github.io/-sicilypalermotour/logo.svg" alt="Sicily Palermo Tour" width="220" style="max-width:220px; width:100%; height:auto; display:block; margin:0 auto 10px auto;">
                        <h2 style="margin:0; font-size:1.25rem;">Aggiornamento Stato Rimborso</h2>
                    </div>
                    <div style="padding:24px;">
                        <h3 style="color:#0b2545; margin-top:0;">Ciao ${customerName},</h3>
                        <p style="font-size:0.95rem; color:#475569; line-height:1.6;">
                            ${descrizioneEmail}
                        </p>
                        <div style="background:#f1f5f9; padding:14px 18px; border-radius:10px; margin:18px 0; font-size:0.9rem; color:#334155;">
                            <strong>Riepilogo:</strong><br>
                            📍 Tour: ${tourTitle}<br>
                            🔑 Codice: ${code}<br>
                            💰 Totale Iniziale: €${total}
                        </div>
                        <div style="background:#fffbf5; border:1.5px solid #fed7aa; border-radius:10px; padding:14px; margin:16px 0; font-size:0.86rem; color:#9a3412; line-height:1.5;">
                            <strong>📜 Regolamento e Termini di Servizio:</strong><br>
                            Il presente rimborso/trattenuta è stato calcolato ed eseguito esattamente in conformità con i <em>Termini e Condizioni di Servizio e Regolamento Penali di Cancellazione</em> accettati al momento della conferma della prenotazione.
                        </div>
                        <p style="font-size:0.9rem; color:#64748b; line-height:1.5;">
                            Per qualsiasi domanda o chiarimento, puoi contattarci direttamente su WhatsApp.
                        </p>
                        <div style="margin-top:20px; text-align:center;">
                            <a href="https://wa.me/${waNum}" style="background:#25d366; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:10px; font-weight:bold; display:inline-block; font-size:0.92rem;">💬 Contattaci su WhatsApp</a>
                        </div>
                    </div>
                    <div style="background:#f1f5f9; padding:14px; text-align:center; font-size:0.8rem; color:#64748b; border-top:1px solid #e2e8f0;">
                        Sicily Palermo Tour - La tua guida speciale a Palermo
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "Sicily Palermo Tour", email: ADMIN_NOTIFICATION_EMAIL },
                    to: [{ email: customerEmail, name: customerName }],
                    subject: titoloEmail,
                    htmlContent: htmlContent
                })
            });
            console.log(`Email di rimborso (${tipo}) inviata a ${customerEmail}`);
        } catch (e) {
            console.error("Errore invio email rimborso Brevo:", e);
        }
    }
}

// Istanza globale del servizio email
window.brevoEmailService = new BrevoEmailService();
