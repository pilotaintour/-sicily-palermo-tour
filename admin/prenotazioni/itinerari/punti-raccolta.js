/**
 * MODULO 1.1: Gestione Punti di Raccolta e Autocomplete Indirizzi Palermo
 * Sicily Palermo Tour - Admin Itinerari
 */

if (typeof window.escapeHtmlAdmin !== 'function') {
    window.escapeHtmlAdmin = function(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
}

const PALERMO_AUTOCOMPLETE_PLACES = [
    { title: 'Piazzale Giotto', subtitle: 'Piazzale Giotto, 90145 Palermo PA' },
    { title: 'Piazza Politeama', subtitle: 'Piazza Castelnuovo / Politeama, Palermo PA' },
    { title: 'Cattedrale di Palermo', subtitle: 'Corso Vittorio Emanuele, 90134 Palermo PA' },
    { title: 'Teatro Massimo', subtitle: 'Piazza Giuseppe Verdi, 90138 Palermo PA' },
    { title: 'Quattro Canti', subtitle: 'Piazza Vigliena / Corso Vittorio Emanuele, Palermo PA' },
    { title: 'Stazione Centrale di Palermo', subtitle: 'Piazza Giulio Cesare, 90123 Palermo PA' },
    { title: 'Porto di Palermo', subtitle: 'Molo Sammuzzo / Banchina Sammuzzo, Palermo PA' },
    { title: 'Mercato di Ballarò', subtitle: 'Via Ballarò, 90134 Palermo PA' },
    { title: 'Mercato della Vucciria', subtitle: 'Piazza Caracciolo, 90133 Palermo PA' },
    { title: 'Mondello - Stabilimento Balneare', subtitle: 'Viale Regina Elena, 90149 Mondello PA' },
    { title: 'Duomo di Monreale', subtitle: 'Piazza Guglielmo II, Monreale PA' },
    { title: 'Aeroporto Falcone Borsellino (PMO)', subtitle: 'Cinisi, Palermo PA' },
    { title: 'Hotel / Alloggio del cliente', subtitle: 'Pick-up su richiesta presso la struttura del cliente' }
];

let autocompleteTimer = null;
if (typeof window.puntiRaccoltaCorrenti === 'undefined' || !Array.isArray(window.puntiRaccoltaCorrenti)) {
    window.puntiRaccoltaCorrenti = ['Piazzale Giotto (Ore 09:00)', 'Villabate (Ore 09:20)'];
}
var puntiRaccoltaCorrenti = window.puntiRaccoltaCorrenti;

function renderCampiPuntiRaccolta() {
    const container = document.getElementById('punti-raccolta-container');
    if (!container) return;

    if (!Array.isArray(window.puntiRaccoltaCorrenti) || window.puntiRaccoltaCorrenti.length === 0) {
        window.puntiRaccoltaCorrenti = ['Piazzale Giotto'];
    }

    container.innerHTML = window.puntiRaccoltaCorrenti.map((punto, index) => {
        const valAttr = String(punto || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        return `
        <div style="position: relative; display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 800; color: #0369a1; font-size: 0.95rem; min-width: 24px; text-align: right;">${index + 1}.</span>
            <div style="flex: 1; position: relative;">
                <input type="text"
                       id="punto-raccolta-input-${index}"
                       value="${valAttr}"
                       onfocus="gestisciAutocompletePuntoRaccolta(${index}, this.value, true)"
                       oninput="aggiornaValorePuntoRaccolta(${index}, this.value); gestisciAutocompletePuntoRaccolta(${index}, this.value)"
                       placeholder="Scrivi o cerca luogo/indirizzo (es. Giotto, Politeama, Cattedrale...)"
                       autocomplete="off"
                       style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; background: #ffffff;">
                <div id="punto-raccolta-suggestions-${index}" class="autocomplete-dropdown hidden"></div>
            </div>
            ${window.puntiRaccoltaCorrenti.length > 1 ? `<button type="button" class="btn-danger btn-small" onclick="rimuoviCampoPuntoRaccolta(${index})" title="Elimina punto" style="padding: 8px 12px;">🗑️</button>` : ''}
        </div>
        `;
    }).join('');
}

function gestisciAutocompletePuntoRaccolta(index, query, isFocus = false) {
    const dropdown = document.getElementById(`punto-raccolta-suggestions-${index}`);
    if (!dropdown) return;

    const q = (query || '').trim().toLowerCase();

    let matches = PALERMO_AUTOCOMPLETE_PLACES.filter(place => {
        if (!q && isFocus) return true;
        if (!q) return false;
        return place.title.toLowerCase().includes(q) || place.subtitle.toLowerCase().includes(q);
    });

    if (matches.length > 0) {
        renderListaSuggerimentiPunto(index, matches, dropdown);
    } else if (q.length < 3) {
        dropdown.innerHTML = '';
        dropdown.classList.add('hidden');
    }

    if (q.length >= 3) {
        if (autocompleteTimer) clearTimeout(autocompleteTimer);
        autocompleteTimer = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Palermo, Italia')}&format=json&addressdetails=1&limit=5`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        const osmMatches = data.map(item => {
                            const name = item.display_name.split(',')[0] || item.display_name;
                            return {
                                title: name,
                                subtitle: item.display_name
                            };
                        });
                        const uniti = [...matches];
                        osmMatches.forEach(o => {
                            if (!uniti.some(u => u.title.toLowerCase() === o.title.toLowerCase())) {
                                uniti.push(o);
                            }
                        });
                        renderListaSuggerimentiPunto(index, uniti, dropdown);
                    }
                })
                .catch(() => {});
        }, 300);
    }
}

function renderListaSuggerimentiPunto(index, lista, dropdown) {
    if (!dropdown || !lista || lista.length === 0) {
        if (dropdown) dropdown.classList.add('hidden');
        return;
    }

    dropdown.innerHTML = lista.map(item => `
        <div class="autocomplete-item" onclick="selezionaPuntoRaccoltaAutocomplete(${index}, '${window.escapeHtmlAdmin(item.title)}')">
            <span style="font-size: 1.1rem; line-height: 1;">📍</span>
            <div>
                <strong style="color: #0b2545; display: block; font-size: 0.92rem;">${window.escapeHtmlAdmin(item.title)}</strong>
                <span style="color: #64748b; font-size: 0.78rem; display: block;">${window.escapeHtmlAdmin(item.subtitle)}</span>
            </div>
        </div>
    `).join('');

    dropdown.classList.remove('hidden');
}

function selezionaPuntoRaccoltaAutocomplete(index, valore) {
    if (!Array.isArray(window.puntiRaccoltaCorrenti)) window.puntiRaccoltaCorrenti = [];
    window.puntiRaccoltaCorrenti[index] = valore;
    const input = document.getElementById(`punto-raccolta-input-${index}`);
    if (input) input.value = valore;

    const dropdown = document.getElementById(`punto-raccolta-suggestions-${index}`);
    if (dropdown) dropdown.classList.add('hidden');
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('#punti-raccolta-container')) {
        document.querySelectorAll('#punti-raccolta-container .autocomplete-dropdown').forEach(d => d.classList.add('hidden'));
    }
});

function aggiungiCampoPuntoRaccolta() {
    if (!Array.isArray(window.puntiRaccoltaCorrenti)) {
        window.puntiRaccoltaCorrenti = ['Piazzale Giotto'];
    }
    window.puntiRaccoltaCorrenti.push('');
    renderCampiPuntiRaccolta();
    setTimeout(() => {
        const inputs = document.querySelectorAll('#punti-raccolta-container input');
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
        }
    }, 50);
}

function rimuoviCampoPuntoRaccolta(index) {
    if (!Array.isArray(window.puntiRaccoltaCorrenti) || window.puntiRaccoltaCorrenti.length <= 1) return;
    window.puntiRaccoltaCorrenti.splice(index, 1);
    renderCampiPuntiRaccolta();
}

function aggiornaValorePuntoRaccolta(index, val) {
    if (Array.isArray(window.puntiRaccoltaCorrenti) && window.puntiRaccoltaCorrenti[index] !== undefined) {
        window.puntiRaccoltaCorrenti[index] = val;
    }
}

// BINDING GLOBALE PER EVENTI INLINE HTML ONCLICK / ONINPUT
window.renderCampiPuntiRaccolta = renderCampiPuntiRaccolta;
window.aggiungiCampoPuntoRaccolta = aggiungiCampoPuntoRaccolta;
window.rimuoviCampoPuntoRaccolta = rimuoviCampoPuntoRaccolta;
window.aggiornaValorePuntoRaccolta = aggiornaValorePuntoRaccolta;
window.gestisciAutocompletePuntoRaccolta = gestisciAutocompletePuntoRaccolta;
window.selezionaPuntoRaccoltaAutocomplete = selezionaPuntoRaccoltaAutocomplete;
