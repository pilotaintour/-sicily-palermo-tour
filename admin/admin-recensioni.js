/**
 * ADMIN - GESTIONE RECENSIONI - Sicily Palermo Tour
 */

const RECENSIONI_STORAGE_KEY = 'spt_recensioni';

function getRecensioni() {
    try {
        const salvate = localStorage.getItem(RECENSIONI_STORAGE_KEY);
        return salvate ? JSON.parse(salvate) : [];
    } catch (e) {
        return [];
    }
}

function salvaRecensioni(lista) {
    try {
        localStorage.setItem(RECENSIONI_STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {}
}

function escapeHtmlRecensione(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function caricaRecensioniAdmin() {
    const container = document.getElementById('admin-recensioni-list');
    if (!container) return;

    // Sincronizza prima dal Cloud se disponibile
    if (window.cloudDB && typeof window.cloudDB.fetchRecensioniCloud === 'function') {
        window.cloudDB.fetchRecensioniCloud().then(list => {
            renderTabellaRecensioniAdmin(list || getRecensioni());
        });
    } else {
        renderTabellaRecensioniAdmin(getRecensioni());
    }
}

function renderTabellaRecensioniAdmin(lista) {
    const container = document.getElementById('admin-recensioni-list');
    if (!container) return;

    if (!lista || lista.length === 0) {
        container.innerHTML = `<p style="color: #64748b; text-align: center; padding: 20px;">Nessuna recensione presente.</p>`;
        return;
    }

    container.innerHTML = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="background: #1b4f72; color: white; text-align: left;">
                        <th style="padding: 10px; border: 1px solid #cbd5e1;">Data</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1;">Nome e Cognome</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Voto</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1;">Testo & Foto</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(rec => {
                        const stelle = '★'.repeat(rec.voto || 5) + '☆'.repeat(5 - (rec.voto || 5));
                        const fotoAdminHtml = (rec.foto && Array.isArray(rec.foto) && rec.foto.length > 0) ? `
                            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px;">
                                ${rec.foto.map(img => `<img src="${img}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;" onclick="window.open(this.src)" title="Clicca per ingrandire">`).join('')}
                            </div>
                        ` : '';

                        return `
                            <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                                <td style="padding: 10px; border: 1px solid #cbd5e1; white-space: nowrap; color: #64748b;">${escapeHtmlRecensione(rec.data || 'N/D')}</td>
                                <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0b2545;">${escapeHtmlRecensione(rec.nome)}</td>
                                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #d97706; white-space: nowrap;">${stelle}</td>
                                <td style="padding: 10px; border: 1px solid #cbd5e1; color: #334155; max-width: 350px;">
                                    <div>"${escapeHtmlRecensione(rec.testo)}"</div>
                                    ${fotoAdminHtml}
                                </td>
                                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; white-space: nowrap;">
                                    <button type="button" onclick="adminEliminaRecensione(${rec.id})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.82rem;">🗑️ Elimina</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function adminEliminaRecensione(id) {
    if (confirm("Sei sicuro di voler eliminare questa recensione? Verrà rimossa dal cloud per tutti i visitatori.")) {
        let lista = getRecensioni();
        lista = lista.filter(r => r.id !== id);
        salvaRecensioni(lista);

        if (window.cloudDB && typeof window.cloudDB.salvaRecensioniCloud === 'function') {
            window.cloudDB.salvaRecensioniCloud(lista);
        }

        caricaRecensioniAdmin();
        if (typeof renderRecensioniGrid === 'function') renderRecensioniGrid();
        alert('🗑️ Recensione eliminata con successo!');
    }
}
