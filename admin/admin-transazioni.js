/**
 * MODULO AUTONOMO DEDICATO: Gestione Transazioni, Incassi & Rimborsi Stripe
 * Sicily Palermo Tour - Admin Dashboard con Funzioni Globali Esplicite
 */

let filtroStatoTransazioniTab = 'IN_ATTESA'; // 'IN_ATTESA', 'INCASSATE', 'RIMBORSATE', 'TUTTE'
let filtroItinerarioTransazioni = 'TUTTI'; // 'TUTTI' oppure Titolo Itinerario
let filtroDataTransazioni = 'TUTTI'; // 'TUTTI' oppure Data della Visita
let ricercaTransazioniText = '';

function copiaTestoAppunti(testo, el) {
    if (!testo) return;
    navigator.clipboard.writeText(testo).then(() => {
        if (el) {
            const originalText = el.innerText;
            el.innerText = "Copiato! 📋";
            el.style.background = "#dcfce7";
            el.style.color = "#15803d";
            setTimeout(() => {
                el.innerText = originalText;
                el.style.background = "#ffffff";
                el.style.color = "#0b2545";
            }, 1200);
        }
    }).catch(e => {
        console.error("Errore copia negli appunti:", e);
    });
}
window.copiaTestoAppunti = copiaTestoAppunti;

function apriChatWhatsAppCliente(telefono, nome, tour) {
    let cleanNum = (telefono || '').replace(/[^0-9]/g, '');
    if (cleanNum.length === 10 && cleanNum.startsWith('3')) {
        cleanNum = '39' + cleanNum;
    }

    if (!cleanNum || cleanNum.length < 8) {
        const inputNum = prompt('Inserisci il numero WhatsApp del cliente (con prefisso, es. 393401234567):', cleanNum || '39');
        if (!inputNum) return;
        cleanNum = inputNum.replace(/[^0-9]/g, '');
    }

    const clientName = nome || 'Cliente';
    const tourName = tour || 'Tour Palermo';
    const msg = `Ciao ${clientName}! Ti contattiamo da Sicily Palermo Tour riguardo la tua prenotazione per il tour "${tourName}".`;

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
}
window.apriChatWhatsAppCliente = apriChatWhatsAppCliente;

function getTransazioniAdmin() {
    try {
        const saved = localStorage.getItem('spt_bookings') || '[]';
        return JSON.parse(saved);
    } catch (e) {
        console.error("Errore lettura transazioni:", e);
        return [];
    }
}

function saveTransazioniAdmin(list) {
    localStorage.setItem('spt_bookings', JSON.stringify(list));
    if (window.cloudDB) {
        window.cloudDB.salvaPrenotazioniCloud(list);
    }
}

function selezionaTabStatoTransazioni(stato) {
    filtroStatoTransazioniTab = stato;
    caricaSezioneTransazioni();
}
window.selezionaTabStatoTransazioni = selezionaTabStatoTransazioni;

function caricaSezioneTransazioni() {
    const container = document.getElementById('sezione-transazioni');
    if (!container) return;

    const list = getTransazioniAdmin();

    const itinerariUnici = [...new Set(list.map(b => b.tourTitle).filter(Boolean))].sort();
    const dateUniche = [...new Set(list.map(b => b.dateReadable || b.dateISO).filter(Boolean))].sort();

    const countInAttesa = list.filter(b => !b.status || b.status === 'In attesa' || b.status.includes('Sospeso')).length;
    const countIncassate = list.filter(b => b.status === 'Incassata' || b.status === 'Confermata' || (b.status && b.status.includes('Incassat'))).length;
    const countRimborsate = list.filter(b => b.status === 'Rimborsata' || b.status === 'Cancellata' || (b.status && b.status.includes('Rimborsat'))).length;

    const badgeTab = document.getElementById('cnt-transazioni-badge');
    if (badgeTab) badgeTab.textContent = countInAttesa;

    let filtrate = list.filter(b => {
        const statusStr = b.status || 'In attesa';
        if (filtroStatoTransazioniTab === 'IN_ATTESA') {
            if (statusStr !== 'In attesa' && !statusStr.includes('Sospeso')) return false;
        } else if (filtroStatoTransazioniTab === 'INCASSATE') {
            if (statusStr !== 'Incassata' && statusStr !== 'Confermata' && !statusStr.includes('Incassat')) return false;
        } else if (filtroStatoTransazioniTab === 'RIMBORSATE') {
            if (statusStr !== 'Rimborsata' && statusStr !== 'Cancellata' && !statusStr.includes('Rimborsat')) return false;
        }

        if (filtroItinerarioTransazioni !== 'TUTTI' && b.tourTitle !== filtroItinerarioTransazioni) {
            return false;
        }

        const dateStr = b.dateReadable || b.dateISO;
        if (filtroDataTransazioni !== 'TUTTI' && dateStr !== filtroDataTransazioni) {
            return false;
        }

        if (ricercaTransazioniText) {
            const term = ricercaTransazioniText.toLowerCase();
            const matchCode = (b.code || '').toLowerCase().includes(term);
            const matchName = (b.customerName || '').toLowerCase().includes(term);
            const matchEmail = (b.customerEmail || '').toLowerCase().includes(term);
            const matchStripe = (b.paymentIntentId || '').toLowerCase().includes(term);
            return matchCode || matchName || matchEmail || matchStripe;
        }
        return true;
    });

    let toolbarEliminaMassa = '';
    if (filtroStatoTransazioniTab === 'INCASSATE' && countIncassate > 0) {
        toolbarEliminaMassa = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 10px; padding: 12px 18px; flex-wrap: wrap; gap: 10px;">
                <strong style="color: #065f46; font-size: 0.95rem;">🟢 Cartella Transazioni Incassate (${countIncassate} Schede)</strong>
                <button type="button" class="btn-danger btn-small" style="background: #dc2626; font-weight: 800; border-radius: 8px; padding: 8px 16px; font-size: 0.88rem;" onclick="eliminaTutteTransazioniPerStato('INCASSATE')">
                    🧹 Elimina Tutte le Schede Incassate (${countIncassate})
                </button>
            </div>
        `;
    } else if (filtroStatoTransazioniTab === 'RIMBORSATE' && countRimborsate > 0) {
        toolbarEliminaMassa = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px; padding: 12px 18px; flex-wrap: wrap; gap: 10px;">
                <strong style="color: #991b1b; font-size: 0.95rem;">🔴 Cartella Transazioni Rimborsate / Sbloccate (${countRimborsate} Schede)</strong>
                <button type="button" class="btn-danger btn-small" style="background: #dc2626; font-weight: 800; border-radius: 8px; padding: 8px 16px; font-size: 0.88rem;" onclick="eliminaTutteTransazioniPerStato('RIMBORSATE')">
                    🧹 Elimina Tutte le Schede Rimborsate (${countRimborsate})
                </button>
            </div>
        `;
    }

    let html = `
        <div class="card" style="background: #ffffff; border-radius: 16px; padding: 22px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 2px solid #0b2545; padding-bottom: 14px; margin-bottom: 20px;">
                <div>
                    <h2 style="color: #0b2545; margin: 0; font-size: 1.5rem; font-weight: 800;">
                        💳 Gestione Transazioni & Incassi Stripe
                    </h2>
                    <p style="color: #64748b; font-size: 0.9rem; margin: 4px 0 0 0;">
                        Gestisci pre-autorizzazioni in sospeso, incassi accreditati, penali e rimborsi sblocco carta a 0€ commissioni.
                    </p>
                </div>

                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select onchange="filtroDataTransazioni = this.value; caricaSezioneTransazioni();" style="padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 0.88rem; color: #0b2545; font-weight: bold; background: #ffffff;">
                        <option value="TUTTI" ${filtroDataTransazioni === 'TUTTI' ? 'selected' : ''}>📅 Tutte le Date (${dateUniche.length})</option>
                        ${dateUniche.map(d => `<option value="${escapeHtmlTransazione(d)}" ${filtroDataTransazioni === d ? 'selected' : ''}>📅 ${escapeHtmlTransazione(d)}</option>`).join('')}
                    </select>

                    <select onchange="filtroItinerarioTransazioni = this.value; caricaSezioneTransazioni();" style="padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 0.88rem; color: #0b2545; font-weight: bold; background: #ffffff;">
                        <option value="TUTTI" ${filtroItinerarioTransazioni === 'TUTTI' ? 'selected' : ''}>🏛️ Tutti gli Itinerari (${itinerariUnici.length})</option>
                        ${itinerariUnici.map(t => `<option value="${escapeHtmlTransazione(t)}" ${filtroItinerarioTransazioni === t ? 'selected' : ''}>🏛️ ${escapeHtmlTransazione(t)}</option>`).join('')}
                    </select>

                    <input type="text" placeholder="🔎 Cerca per Codice, Nome..." value="${escapeHtmlTransazione(ricercaTransazioniText)}" oninput="ricercaTransazioniText = this.value; caricaSezioneTransazioni();" style="padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 0.88rem; width: 190px;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 22px;">

                <div onclick="selezionaTabStatoTransazioni('IN_ATTESA')" style="touch-action: manipulation; user-select: none; -webkit-tap-highlight-color: transparent; background: ${filtroStatoTransazioniTab === 'IN_ATTESA' ? 'linear-gradient(135deg, #0b2545, #134074)' : '#ffffff'}; color: ${filtroStatoTransazioniTab === 'IN_ATTESA' ? '#ffffff' : '#0f172a'}; border: 2px solid #0b2545; border-radius: 14px; padding: 18px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.85rem; font-weight: 700; opacity: 0.9;">⏳ IN ATTESA (Sospese)</div>
                    <div style="font-size: 1.8rem; font-weight: 900; margin-top: 4px;">${countInAttesa} <span style="font-size: 0.9rem; font-weight: normal;">schede</span></div>
                    <div style="font-size: 0.78rem; opacity: 0.8; margin-top: 4px;">Pre-Autorizzazioni bloccate su carta</div>
                </div>

                <div onclick="selezionaTabStatoTransazioni('INCASSATE')" style="touch-action: manipulation; user-select: none; -webkit-tap-highlight-color: transparent; background: ${filtroStatoTransazioniTab === 'INCASSATE' ? 'linear-gradient(135deg, #059669, #10b981)' : '#ffffff'}; color: ${filtroStatoTransazioniTab === 'INCASSATE' ? '#ffffff' : '#0f172a'}; border: 2px solid #059669; border-radius: 14px; padding: 18px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.85rem; font-weight: 700; opacity: 0.9;">🟢 INCASSATE (Accreditate)</div>
                    <div style="font-size: 1.8rem; font-weight: 900; margin-top: 4px;">${countIncassate} <span style="font-size: 0.9rem; font-weight: normal;">schede</span></div>
                    <div style="font-size: 0.78rem; opacity: 0.8; margin-top: 4px;">Transazioni accreditate su Stripe</div>
                </div>

                <div onclick="selezionaTabStatoTransazioni('RIMBORSATE')" style="touch-action: manipulation; user-select: none; -webkit-tap-highlight-color: transparent; background: ${filtroStatoTransazioniTab === 'RIMBORSATE' ? 'linear-gradient(135deg, #dc2626, #ef4444)' : '#ffffff'}; color: ${filtroStatoTransazioniTab === 'RIMBORSATE' ? '#ffffff' : '#0f172a'}; border: 2px solid #dc2626; border-radius: 14px; padding: 18px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.85rem; font-weight: 700; opacity: 0.9;">🔴 RIMBORSATE / SBLOCCATE</div>
                    <div style="font-size: 1.8rem; font-weight: 900; margin-top: 4px;">${countRimborsate} <span style="font-size: 0.9rem; font-weight: normal;">schede</span></div>
                    <div style="font-size: 0.78rem; opacity: 0.8; margin-top: 4px;">Sbloccate al 100% (0€ commissioni)</div>
                </div>

                <div onclick="selezionaTabStatoTransazioni('TUTTE')" style="touch-action: manipulation; user-select: none; -webkit-tap-highlight-color: transparent; background: ${filtroStatoTransazioniTab === 'TUTTE' ? '#334155' : '#ffffff'}; color: ${filtroStatoTransazioniTab === 'TUTTE' ? '#ffffff' : '#0f172a'}; border: 2px solid #334155; border-radius: 14px; padding: 18px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.85rem; font-weight: 700; opacity: 0.9;">📊 TUTTE LE TRANSAZIONI</div>
                    <div style="font-size: 1.8rem; font-weight: 900; margin-top: 4px;">${list.length} <span style="font-size: 0.9rem; font-weight: normal;">totali</span></div>
                    <div style="font-size: 0.78rem; opacity: 0.8; margin-top: 4px;">Archivio completo transazioni</div>
                </div>

            </div>

            ${toolbarEliminaMassa}

            <div id="lista-transazioni-cards">
                ${renderSchedeTransazioniList(filtrate)}
            </div>
        </div>
    `;

    container.innerHTML = html;
}
window.caricaSezioneTransazioni = caricaSezioneTransazioni;

function renderSchedeTransazioniList(list) {
    if (list.length === 0) {
        return `
            <div style="text-align: center; padding: 40px 20px; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p style="font-size: 1.05rem; margin: 0;">Nessuna transazione presente in questa cartella per i filtri selezionati.</p>
            </div>
        `;
    }

    return list.map(b => {
        const isIncassata = b.status === 'Incassata' || b.status === 'Confermata' || (b.status && b.status.includes('Incassat'));
        const isRimborsata = b.status === 'Rimborsata' || b.status === 'Cancellata' || (b.status && b.status.includes('Rimborsat'));

        const statusLabel = isIncassata ? '🟢 Incassata (Accreditata)' : (isRimborsata ? '🔴 Rimborsata / Sbloccata' : '⏳ In Attesa (Pre-Autorizzata)');
        const statusBg = isIncassata ? '#d1fae5; color:#065f46;' : (isRimborsata ? '#fee2e2; color:#991b1b;' : '#fef3c7; color:#92400e;');
        const borderColor = isIncassata ? '#10b981' : (isRimborsata ? '#ef4444' : '#0369a1');

        return `
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-left: 6px solid ${borderColor}; border-radius: 14px; padding: 22px; margin-bottom: 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.03);">

                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <span style="font-size: 0.85rem; color: #0369a1; font-weight: bold;">🔖 Codice Prenotazione:</span>
                        <code onclick="copiaTestoAppunti('${escapeHtmlTransazione(b.code || '#SPT-BOOK')}', this)" style="font-family: monospace; font-weight: bold; background: #ffffff; padding: 3px 8px; border-radius: 6px; border: 1px solid #bae6fd; font-size: 1rem; color: #0b2545; cursor: pointer;" title="Clicca per copiare il codice negli appunti">${escapeHtmlTransazione(b.code || '#SPT-BOOK')} 📋</code>
                    </div>
                    <div>
                        <span style="font-size: 0.85rem; color: #0369a1; font-weight: bold;">🕒 Data e Ora Transazione:</span>
                        <strong style="color: #0b2545;">${escapeHtmlTransazione(b.createdAt || 'Registrato il ' + new Date().toLocaleString('it-IT'))}</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.85rem; color: #0369a1; font-weight: bold;">💳 ID Stripe:</span>
                        <code onclick="copiaTestoAppunti('${escapeHtmlTransazione(b.paymentIntentId || 'pi_stripe')}', this)" style="font-family: monospace; font-size: 0.85rem; background: #ffffff; padding: 3px 8px; border-radius: 6px; border: 1px solid #bae6fd; cursor: pointer;" title="Clicca per copiare l'ID Stripe negli appunti">${escapeHtmlTransazione(b.paymentIntentId || 'pi_stripe')} 📋</code>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;">
                    <h3 style="color: #0b2545; margin: 0; font-size: 1.2rem; font-weight: 800;">
                        🏛️ ${escapeHtmlTransazione(b.tourTitle || 'Tour Palermo')}
                    </h3>
                    <span style="font-weight: 800; font-size: 0.88rem; padding: 6px 14px; border-radius: 20px; background: ${statusBg}; border: 1px solid rgba(0,0,0,0.05);">
                        ${statusLabel}
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-size: 0.92rem; color: #334155; margin-bottom: 16px; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <div>📅 <strong>Data Visita:</strong> ${escapeHtmlTransazione(b.dateReadable || b.dateISO || 'N/D')}</div>
                    <div>⏰ <strong>Orario:</strong> ${escapeHtmlTransazione(b.time || '09:30')}</div>
                    <div>🎟️ <strong>Ospiti:</strong> ${b.adults} Adulti ${b.children > 0 ? `, ${b.children} Bambini` : ''}</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #0b2545;">💰 Totale Autorizzato: €${escapeHtmlTransazione(b.total || '0.00')}</div>
                </div>

                <div style="font-size: 0.92rem; color: #475569; margin-bottom: 16px;">
                    👤 <strong>Referente:</strong> ${escapeHtmlTransazione(b.customerName)} | 📧 ${escapeHtmlTransazione(b.customerEmail)} | 📞 ${escapeHtmlTransazione(b.customerPhone)}
                    ${b.billingAddress ? `<div style="margin-top: 4px;">🏠 <strong>Residenza/Fatturazione:</strong> ${escapeHtmlTransazione(b.billingAddress)}</div>` : ''}
                </div>

                <div style="display: flex; gap: 10px; flex-wrap: wrap; padding-top: 14px; border-top: 1px dashed #cbd5e1;">
                    ${!isIncassata ? `
                        <button type="button" class="btn-primary" style="background: linear-gradient(135deg, #059669, #10b981); padding: 10px 18px; font-size: 0.9rem; font-weight: bold; border-radius: 10px;" onclick="eseguiIncassoTotale100('${b.id}')">
                            💰 Incassa 100% (€${b.total || '50.00'})
                        </button>
                        <button type="button" class="btn-secondary" style="background: #d97706; color: white; border: none; padding: 10px 18px; font-size: 0.9rem; font-weight: bold; border-radius: 10px;" onclick="eseguiIncassoPenaleParziale('${b.id}')">
                            ⚖️ Penale / Incasso Parziale
                        </button>
                    ` : `
                        <span style="color: #059669; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center;">✅ Importo già incassato su Stripe (€${b.amountCollected || b.total})</span>
                    `}

                    ${!isRimborsata ? `
                        <button type="button" class="btn-secondary" style="background: #dc2626; color: white; padding: 10px 18px; font-size: 0.9rem; font-weight: bold; border-radius: 10px; border: none;" onclick="eseguiRimborsoSblocco100('${b.id}')">
                            🔄 Rimborso 100% / Sblocca Carta
                        </button>
                    ` : `
                        <span style="color: #dc2626; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center;">🔴 Transazione rimborsata / sbloccata</span>
                    `}

                    <button type="button" class="btn-primary" style="background: #25d366; padding: 10px 16px; font-size: 0.9rem; font-weight: bold; border-radius: 10px;" onclick="apriChatWhatsAppCliente('${escapeHtmlTransazione(b.customerPhone)}', '${escapeHtmlTransazione(b.customerName)}', '${escapeHtmlTransazione(b.tourTitle)}')">
                        💬 WhatsApp
                    </button>

                    <button type="button" class="btn-danger" style="padding: 10px 16px; font-size: 0.9rem; font-weight: bold; border-radius: 10px;" onclick="eliminaTransazioneTab('${b.id}')">
                        🗑️ Elimina
                    </button>
                </div>

            </div>
        `;
    }).join('');
}

// 1. INCASSO TOTALE 100%
async function eseguiIncassoTotale100(bookingId) {
    let list = getTransazioniAdmin();
    const booking = list.find(b => b.id === bookingId);
    if (!booking) return;

    if (!confirm(`💶 Confermi l'incasso TOTALE (100%) di €${booking.total || '50.00'} per la prenotazione ${booking.code}?`)) {
        return;
    }

    const intentId = booking.paymentIntentId || '';
    const importoVal = parseFloat(booking.total) || 50;

    if (window.stripePayment && intentId && intentId.startsWith('pi_')) {
        await window.stripePayment.incassaImportoPreAutorizzato(intentId, importoVal);
    } else {
        alert(`✅ Importo di €${importoVal.toFixed(2)} incassato ed accreditato con successo su Stripe!`);
    }

    booking.status = 'Incassata';
    booking.amountCollected = importoVal.toFixed(2);

    saveTransazioniAdmin(list);
    caricaSezioneTransazioni();
}
window.eseguiIncassoTotale100 = eseguiIncassoTotale100;

// 2. PENALE / INCASSO PARZIALE
async function eseguiIncassoPenaleParziale(bookingId) {
    let list = getTransazioniAdmin();
    const booking = list.find(b => b.id === bookingId);
    if (!booking) return;

    const totalAutorizzato = parseFloat(booking.total || '50.00');

    const inputVal = prompt(
        `⚖️ TRATTENUTA PENALE / INCASSO PARZIALE (Totale Autorizzato: €${totalAutorizzato.toFixed(2)}):\n\n` +
        `Digita la cifra esatta da trattenere/incassare in Euro (es. ${(totalAutorizzato * 0.5).toFixed(2)} per il 50%, oppure ${(totalAutorizzato * 0.3).toFixed(2)} per il 30%):\n\n` +
        `L'eventuale importo rimanente verrà automaticamente rilasciato sulla carta del cliente SENZA alcuna commissione.`,
        (totalAutorizzato * 0.5).toFixed(2)
    );

    if (inputVal === null) return;

    const importoVal = parseFloat(inputVal) || (totalAutorizzato * 0.5);
    const intentId = booking.paymentIntentId || '';

    if (window.stripePayment && intentId && intentId.startsWith('pi_')) {
        await window.stripePayment.incassaImportoPreAutorizzato(intentId, importoVal);
    } else {
        alert(`✅ Penale di €${importoVal.toFixed(2)} incassata con successo! Rimanenza rilasciata al cliente.`);
    }

    booking.status = 'Incassata';
    booking.amountCollected = importoVal.toFixed(2);

    saveTransazioniAdmin(list);

    if (window.brevoEmailService) {
        await window.brevoEmailService.inviaEmailRimborsoPenale(booking, 'PENALE_PARZIALE', importoVal.toFixed(2));
    }

    caricaSezioneTransazioni();
}
window.eseguiIncassoPenaleParziale = eseguiIncassoPenaleParziale;

// 3. RIMBORSO / SBLOCCO CARTA 100%
async function eseguiRimborsoSblocco100(bookingId) {
    let list = getTransazioniAdmin();
    const booking = list.find(b => b.id === bookingId);
    if (!booking) return;

    if (!confirm(`🔄 Confermi lo sblocco/rimborso del 100% (€${booking.total || '50.00'}) per la prenotazione ${booking.code}? (0€ commissioni per te)`)) {
        return;
    }

    const intentId = booking.paymentIntentId || '';

    if (window.stripePayment && intentId && intentId.startsWith('pi_')) {
        await window.stripePayment.sbloccaImportoCarta(intentId, null);
    } else {
        alert(`⚠️ Pre-autorizzazione sbloccata/rimborsata con successo!`);
    }

    booking.status = 'Rimborsata';

    saveTransazioniAdmin(list);

    if (window.brevoEmailService) {
        await window.brevoEmailService.inviaEmailRimborsoPenale(booking, 'RIMBORSO_100', null);
    }

    caricaSezioneTransazioni();
}
window.eseguiRimborsoSblocco100 = eseguiRimborsoSblocco100;

function eliminaTransazioneTab(bookingId) {
    if (confirm("Sei sicuro di voler eliminare questa transazione dall'archivio?")) {
        let list = getTransazioniAdmin();
        list = list.filter(b => b.id !== bookingId);
        saveTransazioniAdmin(list);
        caricaSezioneTransazioni();
    }
}
window.eliminaTransazioneTab = eliminaTransazioneTab;

function eliminaTutteTransazioniPerStato(tipoStato) {
    const etichetta = tipoStato === 'INCASSATE' ? 'INCASSATE' : 'RIMBORSATE / SBLOCCATE';
    if (!confirm(`⚠️ ATTENZIONE:\nSei sicuro di voler eliminare DEFINITIVAMENTE tutte le transazioni nella cartella '${etichetta}' dall'archivio e dal Cloud?`)) {
        return;
    }

    let list = getTransazioniAdmin();
    list = list.filter(b => {
        const statusStr = b.status || 'In attesa';
        if (tipoStato === 'INCASSATE') {
            return !(statusStr === 'Incassata' || statusStr === 'Confermata' || statusStr.includes('Incassat'));
        } else if (tipoStato === 'RIMBORSATE') {
            return !(statusStr === 'Rimborsata' || statusStr === 'Cancellata' || statusStr.includes('Rimborsat'));
        }
        return true;
    });

    saveTransazioniAdmin(list);
    caricaSezioneTransazioni();
    if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
    alert(`✅ Tutte le transazioni '${etichetta}' sono state eliminate con successo dall'archivio e dal Cloud!`);
}
window.eliminaTutteTransazioniPerStato = eliminaTutteTransazioniPerStato;

function escapeHtmlTransazione(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
