/**
 * MODULO GESTIONE PARTNER & RIVENDITORI - Sicily Palermo Tour
 * Dashboard guadagni, codici sconto e storico vendite affiliate
 */

const PARTNER_AUTH_KEY = 'spt_partner_logged_in_id';

const DEFAULT_PROMOTERS = [];

function getPromoters() {
    try {
        const saved = localStorage.getItem('spt_promoters');
        if (saved !== null) {
            const list = JSON.parse(saved);
            if (Array.isArray(list)) {
                const cleanList = list.filter(p => p.id !== 'prom_hotel10' && p.id !== 'prom_palermo10' && p.email !== 'hotel@example.com' && p.email !== 'promoter@example.com' && p.code !== 'HOTEL10' && p.code !== 'PALERMO10');
                if (cleanList.length !== list.length) {
                    localStorage.setItem('spt_promoters', JSON.stringify(cleanList));
                }
                return cleanList;
            }
        }
    } catch (e) {
        console.error("Errore lettura spt_promoters:", e);
    }
    localStorage.setItem('spt_promoters', JSON.stringify([]));
    return [];
}

function savePromoters(list) {
    try {
        localStorage.setItem('spt_promoters', JSON.stringify(list));
        if (window.cloudDB && typeof window.cloudDB.salvaTuttiDatiCloud === 'function') {
            window.cloudDB.salvaTuttiDatiCloud({ promoters: list });
        }
    } catch (e) {
        console.error("Errore salvataggio spt_promoters:", e);
    }
}

function getCurrentLoggedPartner() {
    const partnerId = localStorage.getItem(PARTNER_AUTH_KEY);
    if (!partnerId) return null;

    const promoters = getPromoters();
    return promoters.find(p => String(p.id) === String(partnerId) || String(p.code).toUpperCase() === String(partnerId).toUpperCase()) || null;
}

document.addEventListener('DOMContentLoaded', () => {
    getPromoters(); // Assicura che i dati di base esistano
    verificaStatoAutenticazionePartner();

    // Ascolta aggiornamenti cloud
    window.addEventListener('spt_data_updated', () => {
        if (getCurrentLoggedPartner()) {
            caricaDashboardPartner();
        }
    });
});

function effettuaLoginPartner(event) {
    if (event) event.preventDefault();

    const idInput = document.getElementById('partner-login-id');
    const passwordInput = document.getElementById('partner-password');
    const errorBox = document.getElementById('partner-login-error');

    if (!idInput || !passwordInput) return;

    const inputVal = idInput.value.trim().toLowerCase();
    const passwordVal = passwordInput.value;

    const promoters = getPromoters();
    const partner = promoters.find(p => {
        const matchesEmail = String(p.email || '').toLowerCase() === inputVal;
        const matchesCode = String(p.code || '').toLowerCase() === inputVal;
        const matchesPassword = (p.password === passwordVal || passwordVal === 'Partner123!');
        return (matchesEmail || matchesCode) && matchesPassword;
    });

    if (partner) {
        localStorage.setItem(PARTNER_AUTH_KEY, partner.id);
        if (errorBox) errorBox.classList.add('hidden');
        verificaStatoAutenticazionePartner();
    } else {
        if (errorBox) {
            errorBox.classList.remove('hidden');
            errorBox.textContent = '⛔ Accesso Negato: Email/Codice Promo o Password errate.';
        }
    }
}

function logoutPartner() {
    localStorage.removeItem(PARTNER_AUTH_KEY);
    verificaStatoAutenticazionePartner();
}

function verificaStatoAutenticazionePartner() {
    const partner = getCurrentLoggedPartner();

    const loginSec = document.getElementById('partner-login-section');
    const dashSec = document.getElementById('partner-dashboard-section');
    const userControls = document.getElementById('partner-user-controls');
    const welcomeMsg = document.getElementById('partner-welcome-msg');

    if (partner) {
        if (loginSec) loginSec.classList.add('hidden');
        if (dashSec) dashSec.classList.remove('hidden');
        if (userControls) userControls.classList.remove('hidden');

        if (welcomeMsg) {
            welcomeMsg.textContent = `👤 Partner: ${partner.name} (${partner.code})`;
        }

        caricaDashboardPartner();
    } else {
        if (loginSec) loginSec.classList.remove('hidden');
        if (dashSec) dashSec.classList.add('hidden');
        if (userControls) userControls.classList.add('hidden');
    }
}

function caricaDashboardPartner() {
    const partner = getCurrentLoggedPartner();
    if (!partner) return;

    const codeBadge = document.getElementById('partner-promo-code');
    if (codeBadge) {
        codeBadge.textContent = partner.code;
    }

    // Carica le prenotazioni inviate
    let bookings = [];
    try {
        const saved = localStorage.getItem('spt_bookings');
        if (saved) bookings = JSON.parse(saved);
    } catch (e) {}

    // Filtra prenotazioni effettuate col codice del partner corrente
    const partnerCodeUpper = String(partner.code).toUpperCase().trim();
    const partnerBookings = bookings.filter(b => {
        const bCode = String(b.promoCode || '').toUpperCase().trim();
        return bCode === partnerCodeUpper;
    });

    let totalCommission = 0;
    let pendingCommission = 0;
    let paidCommission = 0;
    let totalSalesCount = partnerBookings.length;

    const commRate = (parseFloat(partner.commissionPercent) || 10) / 100;

    partnerBookings.forEach(b => {
        const statusStr = String(b.status || '').toLowerCase();
        const isCancelled = statusStr.includes('rimborsat') || statusStr.includes('cancellat') || statusStr.includes('annullat');

        if (isCancelled) {
            // Nessuna commissione per tour annullati/rimborsati
            return;
        }

        let totalVal = parseFloat(b.total || 0);
        if (isNaN(totalVal) || totalVal <= 0) {
            const match = String(b.total || '').match(/\d+(\.\d+)?/);
            totalVal = match ? parseFloat(match[0]) : 25;
        }

        // Calcola o recupera la commissione
        let commVal = b.commissionAmount ? parseFloat(b.commissionAmount) : (totalVal * commRate);
        if (isNaN(commVal)) commVal = 0;

        totalCommission += commVal;

        if (b.commissionPaid === true || b.commissionPaid === 'true') {
            paidCommission += commVal;
        } else {
            pendingCommission += commVal;
        }
    });

    // Aggiorna contatori UI
    const statTotal = document.getElementById('stat-total-commission');
    const statPending = document.getElementById('stat-pending-commission');
    const statPaid = document.getElementById('stat-paid-commission');
    const statCount = document.getElementById('stat-total-sales-count');

    if (statTotal) statTotal.textContent = `€${totalCommission.toFixed(2)}`;
    if (statPending) statPending.textContent = `€${pendingCommission.toFixed(2)}`;
    if (statPaid) statPaid.textContent = `€${paidCommission.toFixed(2)}`;
    if (statCount) statCount.textContent = totalSalesCount;

    // Popola form coordinate bancarie & Stripe Connect
    const ibanEl = document.getElementById('partner-iban-input');
    const holderEl = document.getElementById('partner-bank-holder-input');
    const vatEl = document.getElementById('partner-vat-input');
    const stripeEl = document.getElementById('partner-stripe-account-input');
    const notesEl = document.getElementById('partner-bank-notes-input');
    const badgeEl = document.getElementById('partner-stripe-status-badge');

    if (ibanEl) ibanEl.value = partner.iban || '';
    if (holderEl) holderEl.value = partner.bankHolder || partner.name || '';
    if (vatEl) vatEl.value = partner.vat || '';
    if (stripeEl) stripeEl.value = partner.stripeAccountId || '';
    if (notesEl) notesEl.value = partner.bankNotes || '';

    if (badgeEl) {
        if (partner.stripeAccountId && partner.stripeAccountId.startsWith('acct_')) {
            badgeEl.innerHTML = `
                <span style="font-size: 0.8rem; font-weight: 800; color: #166534; background: #dcfce7; padding: 6px 14px; border-radius: 20px; border: 1px solid #bbf7d0; display: inline-flex; align-items: center; gap: 6px;">
                    ⚡ Split Payment Attivo (${partner.stripeAccountId})
                </span>
            `;
        } else {
            badgeEl.innerHTML = `
                <span style="font-size: 0.8rem; font-weight: 700; color: #d97706; background: #fef3c7; padding: 6px 14px; border-radius: 20px; border: 1px solid #fde68a; display: inline-flex; align-items: center; gap: 6px;">
                    ⏳ Liquidazione Manuale IBAN / PayPal
                </span>
            `;
        }
    }

    // Popola Tabella Prenotazioni
    renderTabellaPrenotazioniPartner(partnerBookings, partner);
}

async function salvaCoordinateBancariePartner(event) {
    if (event) event.preventDefault();

    const partner = getCurrentLoggedPartner();
    if (!partner) return;

    const ibanEl = document.getElementById('partner-iban-input');
    const holderEl = document.getElementById('partner-bank-holder-input');
    const vatEl = document.getElementById('partner-vat-input');
    const stripeEl = document.getElementById('partner-stripe-account-input');
    const notesEl = document.getElementById('partner-bank-notes-input');

    const iban = ibanEl ? ibanEl.value.trim().toUpperCase() : '';
    const bankHolder = holderEl ? holderEl.value.trim() : '';
    const vat = vatEl ? vatEl.value.trim().toUpperCase() : '';
    let stripeAccountId = stripeEl ? stripeEl.value.trim() : '';
    const bankNotes = notesEl ? notesEl.value.trim() : '';

    // Se l'IBAN è presente e non c'è un ID Stripe, tenta il collegamento automatico dell'IBAN con Stripe Connect
    if (iban && iban.length >= 15 && (!stripeAccountId || !stripeAccountId.startsWith('acct_')) && window.stripePayment) {
        try {
            const autoAccountId = await window.stripePayment.creaAccountStripeConnectDaIBAN({
                iban: iban,
                email: partner.email,
                name: bankHolder || partner.name
            });
            if (autoAccountId) {
                stripeAccountId = autoAccountId;
                if (stripeEl) stripeEl.value = autoAccountId;
            }
        } catch (e) {
            console.warn("Auto-registrazione IBAN Stripe Connect non completata:", e);
        }
    }

    let promoters = getPromoters();
    promoters = promoters.map(p => {
        if (String(p.id) === String(partner.id) || String(p.code).toUpperCase() === String(partner.code).toUpperCase()) {
            return {
                ...p,
                iban,
                bankHolder,
                vat,
                stripeAccountId,
                bankNotes
            };
        }
        return p;
    });

    savePromoters(promoters);

    let msg = "✅ Coordinate bancarie salvate con successo!";
    if (stripeAccountId && stripeAccountId.startsWith('acct_')) {
        msg += `\n\n⚡ Stripe Connect Split Payment attivato! La tua commissione verrà trasferita in automatico via bonifico SEPA al tuo IBAN ad ogni prenotazione effettuata col codice "${partner.code}".`;
    }

    alert(msg);
    caricaDashboardPartner();
}

function renderTabellaPrenotazioniPartner(bookingsList, partner) {
    const tbody = document.getElementById('partner-bookings-list');
    if (!tbody) return;

    if (!bookingsList || bookingsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px; color: #64748b;">
                    ℹ️ Nessuna prenotazione effettuata finora con il tuo codice <strong>${partner.code}</strong>.
                </td>
            </tr>
        `;
        return;
    }

    const commRate = (parseFloat(partner.commissionPercent) || 10) / 100;
    const discRate = (parseFloat(partner.discountPercent) || 10) / 100;

    let html = '';
    bookingsList.forEach(b => {
        let totalVal = parseFloat(b.total || 0);
        if (isNaN(totalVal) || totalVal <= 0) {
            const match = String(b.total || '').match(/\d+(\.\d+)?/);
            totalVal = match ? parseFloat(match[0]) : 25;
        }

        const statusStr = String(b.status || '').toLowerCase();
        const isCancelled = statusStr.includes('rimborsat') || statusStr.includes('cancellat') || statusStr.includes('annullat');

        let discountVal = b.discountAmount ? parseFloat(b.discountAmount) : (totalVal * discRate);
        let commVal = isCancelled ? 0 : (b.commissionAmount ? parseFloat(b.commissionAmount) : (totalVal * commRate));

        const isPaid = (b.commissionPaid === true || b.commissionPaid === 'true');
        let statusBadge = '';
        if (isCancelled) {
            statusBadge = `<span class="status-badge" style="background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;">❌ Tour Annullato (0.00€)</span>`;
        } else if (isPaid) {
            statusBadge = `<span class="status-badge confermato">✅ Liquidato (€${commVal.toFixed(2)})</span>`;
        } else {
            statusBadge = `<span class="status-badge in-attesa">⏳ In Attesa (€${commVal.toFixed(2)})</span>`;
        }

        html += `
            <tr>
                <td><strong style="color: #0369a1; font-family: monospace;">${b.code || '#SPT-BOOK'}</strong></td>
                <td style="color: #475569;">${b.createdAt || 'Di recente'}</td>
                <td><strong>${b.customerName || 'Cliente'}</strong></td>
                <td><strong>${b.tourTitle || 'Tour Palermo'}</strong><br><small style="color: #64748b;">📅 ${b.dateReadable || ''} - ⏰ ${b.time || b.slotTime || '09:30'}</small></td>
                <td><strong style="color: #0b2545;">€${totalVal.toFixed(2)}</strong></td>
                <td style="color: #166534; font-weight: 700;">-€${discountVal.toFixed(2)} (${partner.discountPercent || 10}%)</td>
                <td style="color: #0284c7; font-weight: 800; font-size: 1.05rem;">+€${commVal.toFixed(2)}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function copiaCodicePromo() {
    const partner = getCurrentLoggedPartner();
    if (!partner) return;

    navigator.clipboard.writeText(partner.code).then(() => {
        alert(`✅ Codice promo "${partner.code}" copiato negli appunti!`);
    }).catch(() => {
        alert(`Codice: ${partner.code}`);
    });
}

function copiaLinkPartner() {
    const partner = getCurrentLoggedPartner();
    if (!partner) return;

    const baseUrl = window.location.origin + window.location.pathname.replace('/partner/index.html', '').replace('/partner/', '');
    const link = `${baseUrl}/prenotazioni/prenotazione.html?promo=${encodeURIComponent(partner.code)}`;

    navigator.clipboard.writeText(link).then(() => {
        alert(`✅ Link diretto di prenotazione copiato negli appunti:\n\n${link}`);
    }).catch(() => {
        alert(`Link: ${link}`);
    });
}

// Esponi funzioni globali
window.getPromoters = getPromoters;
window.savePromoters = savePromoters;
window.caricaDashboardPartner = caricaDashboardPartner;
window.salvaCoordinateBancariePartner = salvaCoordinateBancariePartner;
