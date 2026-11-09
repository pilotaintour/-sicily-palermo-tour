/**
 * MODULO GESTIONE RIVENDITORI & PROMOTER (ADMIN) - Sicily Palermo Tour
 * Creazione, Modifica e Gestione Commissioni Promozionali
 */

function caricaPromotersAdmin() {
    const listContainer = document.getElementById('admin-promoters-list');
    if (!listContainer) return;

    let promoters = [];
    if (typeof getPromoters === 'function') {
        promoters = getPromoters();
    } else {
        try { promoters = JSON.parse(localStorage.getItem('spt_promoters') || '[]'); } catch (e) {}
    }

    let bookings = [];
    try { bookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]'); } catch (e) {}

    const countBadge = document.getElementById('cnt-promoters-badge');
    if (countBadge) countBadge.textContent = promoters.length;

    if (!promoters || promoters.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #ffffff; border-radius: 12px; border: 1.5px dashed #cbd5e1; color: #64748b;">
                ℹ️ Nessun rivenditore o codice promo registrato. Usa il modulo qui sopra per crearne uno nuovo!
            </div>
        `;
        return;
    }

    let html = '';
    promoters.forEach(p => {
        const pCodeUpper = String(p.code).toUpperCase().trim();
        const pBookings = bookings.filter(b => String(b.promoCode || '').toUpperCase().trim() === pCodeUpper);

        const commRate = (parseFloat(p.commissionPercent) || 10) / 100;
        let totalCommission = 0;
        let pendingCommission = 0;
        let paidCommission = 0;

        pBookings.forEach(b => {
            const statusStr = String(b.status || '').toLowerCase();
            const isCancelled = statusStr.includes('rimborsat') || statusStr.includes('cancellat') || statusStr.includes('annullat');
            if (isCancelled) return;

            let totalVal = parseFloat(b.total || 0);
            if (isNaN(totalVal) || totalVal <= 0) {
                const match = String(b.total || '').match(/\d+(\.\d+)?/);
                totalVal = match ? parseFloat(match[0]) : 25;
            }
            let commVal = b.commissionAmount ? parseFloat(b.commissionAmount) : (totalVal * commRate);
            if (isNaN(commVal)) commVal = 0;

            totalCommission += commVal;
            if (b.commissionPaid === true || b.commissionPaid === 'true') {
                paidCommission += commVal;
            } else {
                pendingCommission += commVal;
            }
        });

        html += `
            <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <h3 style="color: #0b2545; font-size: 1.15rem; margin: 0;">🏢 ${p.name}</h3>
                            <span style="font-family: monospace; font-size: 1.1rem; font-weight: 800; color: #0369a1; background: #e0f2fe; padding: 3px 10px; border-radius: 6px; border: 1.5px dashed #0284c7;">${p.code}</span>
                        </div>
                        <p style="font-size: 0.88rem; color: #64748b; margin-top: 4px;">
                            📧 Email: <strong>${p.email}</strong> | 🔑 Pass: <code>${p.password || 'Partner123!'}</code> | 📞 Tel: ${p.phone || 'N.D.'}
                        </p>
                    </div>

                    <div style="display: flex; gap: 8px;">
                        ${pendingCommission > 0 ? `
                            <button onclick="liquidaTutteCommissioniPartner('${p.code}')" class="btn-primary btn-small" style="background: #166534;" title="Segna tutte le commissioni come pagate">
                                💸 Liquida €${pendingCommission.toFixed(2)}
                            </button>
                        ` : ''}
                        <button onclick="eliminaPromoterAdmin('${p.id}')" class="btn-danger btn-small" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                            🗑️ Elimina
                        </button>
                    </div>
                </div>

                <!-- Griglia Riepilogo Guadagni Rivenditore -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <div>
                        <span style="font-size: 0.78rem; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Sconto Turista</span>
                        <strong style="color: #166534; font-size: 1rem;">${p.discountPercent || 10}% Off</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Commissione Partner</span>
                        <strong style="color: #0369a1; font-size: 1rem;">${p.commissionPercent || 10}% (€)</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Prenotazioni Totali</span>
                        <strong style="color: #7e22ce; font-size: 1rem;">🎟️ ${pBookings.length} Tour</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">In Attesa di Pagamento</span>
                        <strong style="color: #d97706; font-size: 1rem;">€${pendingCommission.toFixed(2)}</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Già Liquidato</span>
                        <strong style="color: #166534; font-size: 1rem;">€${paidCommission.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

function salvaNuovoPromoterAdmin(event) {
    if (event) event.preventDefault();

    const nameEl = document.getElementById('new-promoter-name');
    const codeEl = document.getElementById('new-promoter-code');
    const emailEl = document.getElementById('new-promoter-email');
    const passEl = document.getElementById('new-promoter-password');
    const discEl = document.getElementById('new-promoter-discount');
    const commEl = document.getElementById('new-promoter-commission');
    const phoneEl = document.getElementById('new-promoter-phone');

    if (!nameEl || !codeEl || !emailEl) return;

    const name = nameEl.value.trim();
    const code = codeEl.value.trim().toUpperCase().replace(/\s+/g, '');
    const email = emailEl.value.trim().toLowerCase();
    const password = (passEl && passEl.value.trim()) ? passEl.value.trim() : 'Partner123!';
    const discountPercent = parseFloat(discEl ? discEl.value : 10) || 10;
    const commissionPercent = parseFloat(commEl ? commEl.value : 10) || 10;
    const phone = phoneEl ? phoneEl.value.trim() : '';

    if (!name || !code || !email) {
        alert('⚠️ Per favore inserisci Nome, Codice Promo ed Email per creare il rivenditore.');
        return;
    }

    let promoters = typeof getPromoters === 'function' ? getPromoters() : [];

    // Verifico se esiste già lo stesso codice
    const esiste = promoters.some(p => String(p.code).toUpperCase() === code);
    if (esiste) {
        alert(`⚠️ Il codice promo "${code}" è già in uso. Inseriscine un altro univoco.`);
        return;
    }

    const newPromoter = {
        id: 'prom_' + Date.now(),
        code: code,
        name: name,
        email: email,
        password: password,
        discountPercent: discountPercent,
        commissionPercent: commissionPercent,
        phone: phone,
        createdAt: new Date().toLocaleDateString('it-IT'),
        status: 'active'
    };

    promoters.push(newPromoter);

    if (typeof savePromoters === 'function') {
        savePromoters(promoters);
    } else {
        localStorage.setItem('spt_promoters', JSON.stringify(promoters));
    }

    alert(`✅ Rivenditore "${name}" con codice "${code}" salvato con successo!`);

    // Reset Form
    nameEl.value = '';
    codeEl.value = '';
    emailEl.value = '';
    if (passEl) passEl.value = '';
    if (phoneEl) phoneEl.value = '';

    caricaPromotersAdmin();
}

function liquidaTutteCommissioniPartner(code) {
    if (!code) return;
    if (!confirm(`Sei sicuro di voler segnare come PAGATE tutte le commissioni per il codice "${code}"?`)) return;

    try {
        let bookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]');
        const codeUpper = String(code).toUpperCase().trim();

        let modifCount = 0;
        bookings = bookings.map(b => {
            if (String(b.promoCode || '').toUpperCase().trim() === codeUpper) {
                b.commissionPaid = true;
                b.commissionPaidAt = new Date().toLocaleString('it-IT');
                modifCount++;
            }
            return b;
        });

        localStorage.setItem('spt_bookings', JSON.stringify(bookings));
        if (window.cloudDB) {
            window.cloudDB.salvaPrenotazioniCloud(bookings);
        }

        alert(`✅ Segnate come PAGATE le commissioni per ${modifCount} prenotazioni!`);
        caricaPromotersAdmin();
    } catch (e) {
        console.error("Errore liquidazione commissioni:", e);
    }
}

function eliminaPromoterAdmin(id) {
    if (!id) return;
    if (!confirm("Sei sicuro di voler eliminare questo rivenditore?")) return;

    let promoters = typeof getPromoters === 'function' ? getPromoters() : [];
    promoters = promoters.filter(p => String(p.id) !== String(id));

    if (typeof savePromoters === 'function') {
        savePromoters(promoters);
    } else {
        localStorage.setItem('spt_promoters', JSON.stringify(promoters));
    }

    alert("✅ Rivenditore eliminato.");
    caricaPromotersAdmin();
}

// Esponi le funzioni globalmente
window.caricaPromotersAdmin = caricaPromotersAdmin;
window.salvaNuovoPromoterAdmin = salvaNuovoPromoterAdmin;
window.liquidaTutteCommissioniPartner = liquidaTutteCommissioniPartner;
window.eliminaPromoterAdmin = eliminaPromoterAdmin;
