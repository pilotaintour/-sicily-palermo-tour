/**
 * MODULO TEMPLATE EMAIL & DIZIONARIO MULTILINGUA
 * Sicily Palermo Tour - Generazione Layout HTML per Email di Conferma, Contatti e Rimborsi
 */

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

class EmailTemplateBuilder {

    getDictionary(langKey) {
        return i18nEmail[langKey] || i18nEmail.it;
    }

    generaHtmlEmail(bookingData, langKey, tDict, tConf) {
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

        return `
            <!DOCTYPE html>
            <html lang="${langKey}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; background-color:#f4f7f9; margin:0; padding:20px 10px; color:#0f172a;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed; max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 10px 30px rgba(11,37,69,0.08);">
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
                    <tr>
                        <td style="padding:28px 22px;">
                            <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px; text-align: center;">
                                <span style="font-size: 1.25rem;">✅</span>
                                <strong style="color: #166534; font-size: 0.98rem; margin-left: 6px;">${tDict.badgeSuccess}</strong>
                            </div>

                            <h2 style="color:#0b2545; margin-top:0; font-size:1.35rem; font-weight:800;">Hi ${customerName},</h2>
                            <p style="font-size:0.96rem; color:#475569; line-height:1.6; margin-bottom:20px;">
                                ${tConf.welcomeMessage}
                            </p>

                            <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:14px; padding:20px; margin:20px 0; box-sizing:border-box;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
                                    <tr>
                                        <td style="color:#64748b; font-weight:bold; font-size:0.9rem; padding-bottom:4px;">${tDict.codeLabel}</td>
                                        <td align="right" style="font-weight:bold; font-size:1.1rem; color:#0369a1; font-family:monospace;">${code}</td>
                                    </tr>
                                </table>

                                <div style="margin-bottom:14px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
                                    <div style="color:#64748b; font-weight:bold; font-size:0.88rem; margin-bottom:6px;">${tDict.transLabel}</div>
                                    <div style="background:#e0f2fe; border:1px solid #bae6fd; border-radius:8px; padding:8px 12px; font-family:monospace; font-size:0.85rem; color:#0b2545; font-weight:bold; word-break:break-all; word-wrap:break-word; overflow-wrap:break-word; display:block;">
                                        🔒 ${stripeRef}
                                    </div>
                                </div>

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

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:14px; padding-top:12px; border-top:2px dashed #cbd5e1; font-size:1.15rem; font-weight:800; color:#0b2545;">
                                    <tr>
                                        <td>${tDict.totalLabel}</td>
                                        <td align="right" style="color:#0369a1; font-size:1.3rem;">€${total}</td>
                                    </tr>
                                </table>
                            </div>

                            <div style="background:#fffbf5; border:1.5px solid #fed7aa; border-radius:12px; padding:16px; margin-bottom:20px; font-size:0.9rem; color:#9a3412; line-height:1.5;">
                                <strong style="display:block; margin-bottom:6px; font-size:0.95rem;">${tDict.instructionsTitle}</strong>
                                ${tConf.instructions}
                            </div>

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
    }
}

// Istanza globale builder template
window.emailTemplateBuilder = new EmailTemplateBuilder();
window.i18nEmail = i18nEmail;
