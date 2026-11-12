/**
 * MODULO 1.2: Gestione Orari, Capienza Bus e Tabella Orari Modale
 * Sicily Palermo Tour - Admin Itinerari
 */

function apriModalTabellaOrari() {
    const modal = document.getElementById('modal-tabella-orari');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        renderCampiOrari();
    }
}

function chiudiModalTabellaOrari(event) {
    if (event && event.target && event.target.id !== 'modal-tabella-orari') {
        return;
    }
    const modal = document.getElementById('modal-tabella-orari');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        renderCampiOrari();
    }
}

function normalizzaOrari(arr) {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(item => {
        if (typeof item === 'string') {
            return { time: item, capacity: 53 };
        }
        if (item && typeof item === 'object' && item.time) {
            return { time: item.time, capacity: parseInt(item.capacity, 10) || 53 };
        }
        return null;
    }).filter(Boolean).sort((a, b) => a.time.localeCompare(b.time));
}

function renderCampiOrari() {
    orariCorrenti = normalizzaOrari(orariCorrenti);

    const chipsContainer = document.getElementById('orari-active-chips');
    if (chipsContainer) {
        if (orariCorrenti.length === 0) {
            chipsContainer.innerHTML = '<span style="font-size:0.85rem; color:#94a3b8;">Nessun orario selezionato. Clicca su "Seleziona Orari dalla Tabella" per aggiungerli!</span>';
        } else {
            chipsContainer.innerHTML = orariCorrenti.map((item, idx) => `
                <span style="background: #e0f2fe; border: 1.5px solid #bae6fd; color: #0369a1; padding: 6px 12px; border-radius: 20px; font-size: 0.88rem; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                    ⏰ <strong>${escapeHtmlAdmin(item.time)}</strong>
                    <input type="number" min="1" max="500" value="${item.capacity}" onchange="aggiornaCapienzaOrario(${idx}, this.value)" style="width: 52px; padding: 2px 4px; border: 1px solid #0369a1; border-radius: 6px; font-weight: bold; text-align: center; color: #0369a1; background: #ffffff; font-size: 0.82rem;" title="Modifica capienza per questo orario">
                    <span style="font-size: 0.78rem; opacity: 0.9;">pers.</span>
                    <button type="button" onclick="toggleOrario('${item.time}')" style="background: transparent; border: none; color: #0369a1; font-weight: bold; cursor: pointer; padding: 0 2px; font-size: 0.9rem;" title="Rimuovi orario">✕</button>
                </span>
            `).join('');
        }
    }

    const tableBody = document.getElementById('orari-table-body');
    if (!tableBody) return;

    let rowsHtml = '';
    for (let h = 8; h <= 23; h++) {
        const hStr = String(h).padStart(2, '0');
        rowsHtml += `<tr>`;
        rowsHtml += `<td style="padding: 8px; font-weight: bold; background: #f8fafc; border: 1px solid #e2e8f0; color: #1b4f72;">${hStr}:00</td>`;

        ['00', '15', '30', '45'].forEach(mStr => {
            const timeStr = `${hStr}:${mStr}`;
            const trovato = orariCorrenti.find(o => o.time === timeStr);
            const isSelected = !!trovato;

            const bgStyle = isSelected
                ? 'background: #1b4f72; color: #ffffff; font-weight: bold;'
                : 'background: #ffffff; color: #334155;';

            rowsHtml += `
                <td style="padding: 4px; border: 1px solid #e2e8f0;">
                    <button type="button"
                            onclick="toggleOrario('${timeStr}')"
                            style="${bgStyle} width: 100%; padding: 6px 2px; border: 1px solid ${isSelected ? '#1b4f72' : '#cbd5e1'}; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: all 0.15s ease;">
                        ${isSelected ? `✓ ${timeStr}<br><small style="font-size:0.72rem; opacity:0.9;">(${trovato.capacity}p)</small>` : timeStr}
                    </button>
                </td>
            `;
        });

        rowsHtml += `</tr>`;
    }

    tableBody.innerHTML = rowsHtml;
}

function toggleOrario(timeStr) {
    const inputCap = document.getElementById('capienza-selezione-input');
    const targetCapacity = inputCap ? (parseInt(inputCap.value, 10) || 53) : 53;

    const idx = orariCorrenti.findIndex(o => o.time === timeStr);

    if (idx !== -1) {
        if (orariCorrenti[idx].capacity === targetCapacity) {
            orariCorrenti.splice(idx, 1);
        } else {
            orariCorrenti[idx].capacity = targetCapacity;
        }
    } else {
        orariCorrenti.push({ time: timeStr, capacity: targetCapacity });
    }

    orariCorrenti.sort((a, b) => a.time.localeCompare(b.time));
    renderCampiOrari();
}

function aggiornaCapienzaOrario(index, nuovaCapienza) {
    if (orariCorrenti[index]) {
        orariCorrenti[index].capacity = parseInt(nuovaCapienza, 10) || 53;
        renderCampiOrari();
    }
}

function applicaPresetOrari(tipo) {
    if (tipo === 'reset') {
        orariCorrenti = [];
        renderCampiOrari();
    }
}

window.apriModalTabellaOrari = apriModalTabellaOrari;
window.chiudiModalTabellaOrari = chiudiModalTabellaOrari;
window.renderCampiOrari = renderCampiOrari;
window.toggleOrario = toggleOrario;
window.aggiornaCapienzaOrario = aggiornaCapienzaOrario;
window.applicaPresetOrari = applicaPresetOrari;
