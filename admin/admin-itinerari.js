/**
 * MODULO 1: Gestione Itinerari, Orari a 15 Minuti, Foto & Tappe
 * Sicily Palermo Tour - Admin
 */

const STORAGE_KEY = 'spt_itineraries';
const AUTH_KEY = 'spt_admin_logged_in';
const AUTHORIZED_EMAIL = 'pilotaintour13@gmail.com';

let fotoItinerarioCorrenti = [];
let tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti storici'];
let puntiRaccoltaCorrenti = ['Piazzale Giotto', 'Piazza Politeama'];
let orariCorrenti = [
    { time: '09:30', capacity: 15 },
    { time: '11:30', capacity: 15 },
    { time: '15:30', capacity: 15 },
    { time: '18:00', capacity: 15 }
];

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

function renderCampiPuntiRaccolta() {
    const container = document.getElementById('punti-raccolta-container');
    if (!container) return;

    if (!puntiRaccoltaCorrenti || puntiRaccoltaCorrenti.length === 0) {
        puntiRaccoltaCorrenti = ['Piazzale Giotto'];
    }

    container.innerHTML = puntiRaccoltaCorrenti.map((punto, index) => `
        <div style="position: relative; display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 800; color: #0369a1; font-size: 0.95rem; min-width: 24px; text-align: right;">${index + 1}.</span>
            <div style="flex: 1; position: relative;">
                <input type="text"
                       id="punto-raccolta-input-${index}"
                       value="${escapeHtmlAdmin(punto)}"
                       onfocus="gestisciAutocompletePuntoRaccolta(${index}, this.value, true)"
                       oninput="aggiornaValorePuntoRaccolta(${index}, this.value); gestisciAutocompletePuntoRaccolta(${index}, this.value)"
                       placeholder="Scrivi o cerca luogo/indirizzo (es. Giotto, Politeama, Cattedrale...)"
                       autocomplete="off"
                       style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;">
                <div id="punto-raccolta-suggestions-${index}" class="autocomplete-dropdown hidden"></div>
            </div>
            ${puntiRaccoltaCorrenti.length > 1 ? `<button type="button" class="btn-danger btn-small" onclick="rimuoviCampoPuntoRaccolta(${index})" title="Elimina punto" style="padding: 8px 12px;">🗑️</button>` : ''}
        </div>
    `).join('');
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
        <div class="autocomplete-item" onclick="selezionaPuntoRaccoltaAutocomplete(${index}, '${escapeHtmlAdmin(item.title)}')">
            <span style="font-size: 1.1rem; line-height: 1;">📍</span>
            <div>
                <strong style="color: #0b2545; display: block; font-size: 0.92rem;">${escapeHtmlAdmin(item.title)}</strong>
                <span style="color: #64748b; font-size: 0.78rem; display: block;">${escapeHtmlAdmin(item.subtitle)}</span>
            </div>
        </div>
    `).join('');

    dropdown.classList.remove('hidden');
}

function selezionaPuntoRaccoltaAutocomplete(index, valore) {
    puntiRaccoltaCorrenti[index] = valore;
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
    puntiRaccoltaCorrenti.push('');
    renderCampiPuntiRaccolta();
    const inputs = document.querySelectorAll('#punti-raccolta-container input');
    if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
    }
}

function rimuoviCampoPuntoRaccolta(index) {
    if (puntiRaccoltaCorrenti.length <= 1) return;
    puntiRaccoltaCorrenti.splice(index, 1);
    renderCampiPuntiRaccolta();
}

function aggiornaValorePuntoRaccolta(index, val) {
    if (puntiRaccoltaCorrenti[index] !== undefined) {
        puntiRaccoltaCorrenti[index] = val;
    }
}

const DEFAULT_ITINERARIES = [];

function pulisciVecchiItinerariDemo(lista) {
    if (!Array.isArray(lista)) return [];
    return lista.filter(item => {
        if (!item) return false;
        const id = String(item.id || '');
        const title = String(item.title || '').toLowerCase().trim();
        const price = String(item.price || '').toLowerCase().trim();

        if (id === '1' || id === '2' || id === '3') return false;
        if (title.includes('dsfsdf') || title.includes('sdfdsf') || title === 'test' || title === 'asdf' || title === 'prova') return false;
        if (price.includes('dsfsdf') || price.includes('sdfdsf')) return false;

        return true;
    });
}

// RECUPERO ITINERARI
function getItinerari() {
    let saved = localStorage.getItem(STORAGE_KEY);
    let list = null;
    if (saved) {
        try {
            list = JSON.parse(saved);
        } catch (e) {
            list = [];
        }
    }
    return (list && Array.isArray(list)) ? pulisciVecchiItinerariDemo(list) : [];
}

async function saveItinerari(itinerari) {
    const cleanList = pulisciVecchiItinerariDemo(itinerari);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));

    if (window.cloudAdmin && window.cloudAdmin.isAuthorized()) {
        await window.cloudAdmin.salvaItinerariAdmin(cleanList);
    } else if (window.cloudDB) {
        await window.cloudDB.salvaItinerariCloud(cleanList);
    }
}

function caricaElencoItinerari() {
    const itinerari = getItinerari();
    const container = document.getElementById('itineraries-list');
    const countBadge = document.getElementById('itinerary-count');

    if (!container) return;

    if (countBadge) countBadge.textContent = itinerari.length;

    if (!itinerari || itinerari.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:20px;">Nessun itinerario presente.</p>';
        return;
    }

    try {
        container.innerHTML = itinerari.map(item => {
            const coverImg = (item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || 'https://via.placeholder.com/90?text=Palermo');
            const totalPhotos = (item.images && item.images.length > 0) ? item.images.length : (item.imageUrl ? 1 : 0);
            const totalOrari = (item.timeSlots && item.timeSlots.length > 0) ? item.timeSlots.length : 0;

            return `
                <div class="itinerary-item">
                    <img class="item-thumb" src="${coverImg}" alt="${escapeHtmlAdmin(item.title)}" onerror="this.src='https://via.placeholder.com/90?text=Foto'">
                    <div class="item-content">
                        <span class="item-badge">${escapeHtmlAdmin(item.category)}</span>
                        <span class="item-badge" style="background:#e0f2fe; color:#0369a1;">🖼️ ${totalPhotos} Foto</span>
                        <span class="item-badge" style="background:#fef3c7; color:#92400e;">⏰ ${totalOrari} Orari Attivi</span>
                        ${item.featured === 'true' ? '<span class="item-badge" style="background:#dbeafe; color:#1e40af;">⭐ Evidenza</span>' : ''}
                        ${item.isConsigliato ? '<span class="item-badge" style="background:#fef3c7; color:#92400e;">⭐ Consigliato</span>' : ''}
                        ${item.isAllaModa ? '<span class="item-badge" style="background:#fee2e2; color:#991b1b;">🔥 Moda</span>' : ''}
                        <div class="item-title">${escapeHtmlAdmin(item.title)}</div>
                        <div class="item-meta">⏱️ ${escapeHtmlAdmin(item.duration || 'N/D')} | 💰 ${escapeHtmlAdmin(item.price || 'N/D')}</div>
                        <div class="item-desc">${escapeHtmlAdmin(item.shortDesc)}</div>
                    </div>
                    <div class="item-actions">
                        <button type="button" class="btn-secondary btn-small" onclick="preparaModifica('${item.id}')">✏️ Edit</button>
                        <button type="button" class="btn-danger btn-small" onclick="eliminaItinerario('${item.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Errore rendering itinerari:", err);
    }
}

function toggleTuttiGiorni(checked) {
    document.querySelectorAll('input[name="giorno-check"]').forEach(c => {
        c.checked = checked;
    });
}

function gestisciTipoDisponibilitaTour(type) {
    const boxDate = document.getElementById('box-single-fixed-date');
    if (!boxDate) return;

    if (type === 'singleDate') {
        boxDate.classList.remove('hidden');
        boxDate.style.display = 'block';
        const dateInput = document.getElementById('single-fixed-date-input');
        if (dateInput) {
            setTimeout(() => dateInput.focus(), 100);
        }
    } else {
        boxDate.classList.add('hidden');
        boxDate.style.display = 'none';
    }
}

async function salvaItinerario(event) {
    event.preventDefault();

    const id = document.getElementById('itinerary-id').value;
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const duration = document.getElementById('duration').value.trim();
    const price = document.getElementById('price').value.trim();
    const pickupPoints = puntiRaccoltaCorrenti.map(p => p.trim()).filter(Boolean);
    const meetingPoint = pickupPoints.length > 0 ? pickupPoints.join(' • ') : 'Palermo Centro';
    const meetingInstructions = document.getElementById('meeting-instructions') ? document.getElementById('meeting-instructions').value.trim() : '';

    const availabilityTypeEl = document.querySelector('input[name="availability-type"]:checked');
    const availabilityType = availabilityTypeEl ? availabilityTypeEl.value : 'weekly';
    const singleFixedDate = document.getElementById('single-fixed-date-input') ? document.getElementById('single-fixed-date-input').value : '';

    const featured = document.getElementById('featured').value;
    const isConsigliatoEl = document.getElementById('is-consigliato');
    const isAllaModaEl = document.getElementById('is-alla-moda');
    const isConsigliato = isConsigliatoEl ? isConsigliatoEl.checked : false;
    const isAllaModa = isAllaModaEl ? isAllaModaEl.checked : false;

    const shortDesc = document.getElementById('short-desc').value.trim();
    const fullDesc = document.getElementById('full-desc').value.trim();

    const giorniChecks = document.querySelectorAll('input[name="giorno-check"]:checked');
    const availableDays = giorniChecks.length > 0 ? Array.from(giorniChecks).map(c => parseInt(c.value, 10)) : [0, 1, 2, 3, 4, 5, 6];

    const tappe = tappeCorrenti.map(t => t.trim()).filter(t => t !== '');

    const serviziChecks = document.querySelectorAll('input[name="servizio-check"]:checked');
    const servizi = Array.from(serviziChecks).map(c => c.value);

    const singleUrl = document.getElementById('image-url').value.trim();
    if (singleUrl && !fotoItinerarioCorrenti.includes(singleUrl)) {
        fotoItinerarioCorrenti.push(singleUrl);
    }

    const images = [...fotoItinerarioCorrenti];
    const imageUrl = images.length > 0 ? images[0] : 'https://via.placeholder.com/400x200?text=Palermo+Tour';
    const timeSlots = [...orariCorrenti];
    const maxCapacity = (timeSlots.length > 0 && typeof timeSlots[0] === 'object') ? timeSlots[0].capacity : 15;

    let itinerari = getItinerari();

    if (id) {
        itinerari = itinerari.map(item => {
            if (String(item.id) === String(id)) {
                return { id, title, category, duration, price, meetingPoint, pickupPoints, meetingInstructions, availabilityType, singleFixedDate, availableDays, timeSlots, maxCapacity, featured, isConsigliato, isAllaModa, imageUrl, images, tappe, servizi, shortDesc, fullDesc };
            }
            return item;
        });
    } else {
        const nuovoItinerario = {
            id: Date.now().toString(),
            title, category, duration, price, meetingPoint, pickupPoints, meetingInstructions, availabilityType, singleFixedDate, availableDays, timeSlots, maxCapacity, featured, isConsigliato, isAllaModa, imageUrl, images, tappe, servizi, shortDesc, fullDesc
        };
        itinerari.unshift(nuovoItinerario);
    }

    await saveItinerari(itinerari);

    alert('☁️ Itinerario salvato e pubblicato sul Cloud per tutti i turisti!');
    resetForm();
    caricaElencoItinerari();
}

function preparaModifica(id) {
    const itinerari = getItinerari();
    const item = itinerari.find(i => String(i.id) === String(id));

    if (!item) return;

    document.getElementById('itinerary-id').value = item.id;
    document.getElementById('title').value = item.title;
    document.getElementById('category').value = item.category;
    document.getElementById('duration').value = item.duration || '';
    document.getElementById('price').value = item.price || '';
    if (item.pickupPoints && Array.isArray(item.pickupPoints) && item.pickupPoints.length > 0) {
        puntiRaccoltaCorrenti = [...item.pickupPoints];
    } else if (item.meetingPoint) {
        puntiRaccoltaCorrenti = item.meetingPoint.split('•').map(s => s.trim()).filter(Boolean);
        if (puntiRaccoltaCorrenti.length === 0) {
            puntiRaccoltaCorrenti = [item.meetingPoint];
        }
    } else {
        puntiRaccoltaCorrenti = ['Piazzale Giotto'];
    }
    renderCampiPuntiRaccolta();

    if (document.getElementById('meeting-instructions')) {
        document.getElementById('meeting-instructions').value = item.meetingInstructions || '';
    }

    const availType = item.availabilityType || 'weekly';
    const radioType = document.querySelector(`input[name="availability-type"][value="${availType}"]`);
    if (radioType) {
        radioType.checked = true;
        gestisciTipoDisponibilitaTour(availType);
    }
    if (document.getElementById('single-fixed-date-input')) {
        document.getElementById('single-fixed-date-input').value = item.singleFixedDate || '';
    }
    document.getElementById('featured').value = item.featured || 'false';
    const isConsigliatoEl = document.getElementById('is-consigliato');
    const isAllaModaEl = document.getElementById('is-alla-moda');
    if (isConsigliatoEl) isConsigliatoEl.checked = !!item.isConsigliato;
    if (isAllaModaEl) isAllaModaEl.checked = !!item.isAllaModa;

    document.getElementById('short-desc').value = item.shortDesc || '';
    document.getElementById('full-desc').value = item.fullDesc || '';

    if (item.tappe && item.tappe.length > 0) {
        tappeCorrenti = [...item.tappe];
    } else {
        tappeCorrenti = ['Incontro con la guida'];
    }
    renderCampiTappe();

    if (item.timeSlots && item.timeSlots.length > 0) {
        orariCorrenti = [...item.timeSlots];
    } else {
        orariCorrenti = [
            { time: '09:30', capacity: 15 },
            { time: '11:30', capacity: 15 },
            { time: '15:30', capacity: 15 },
            { time: '18:00', capacity: 15 }
        ];
    }
    renderCampiOrari();

    const currentDays = (item.availableDays && Array.isArray(item.availableDays)) ? item.availableDays.map(n => String(n)) : ['0','1','2','3','4','5','6'];
    document.querySelectorAll('input[name="giorno-check"]').forEach(c => {
        c.checked = currentDays.includes(String(c.value));
    });
    const checkAll = document.getElementById('check-all-days');
    if (checkAll) checkAll.checked = (currentDays.length === 7);

    const serviziChecks = document.querySelectorAll('input[name="servizio-check"]');
    serviziChecks.forEach(c => {
        c.checked = item.servizi ? item.servizi.includes(c.value) : true;
    });

    if (item.images && item.images.length > 0) {
        fotoItinerarioCorrenti = [...item.images];
    } else if (item.imageUrl) {
        fotoItinerarioCorrenti = [item.imageUrl];
    } else {
        fotoItinerarioCorrenti = [];
    }

    renderGalleriaAnteprima();

    document.getElementById('form-title').textContent = '✏️ Modifica Itinerario';
    document.getElementById('save-btn').textContent = '💾 Salva Modifiche';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
}

function annullaModifica() {
    resetForm();
}

function resetForm() {
    document.getElementById('itineraryForm').reset();
    document.getElementById('itinerary-id').value = '';
    if (document.getElementById('pickup-points')) document.getElementById('pickup-points').value = '';
    if (document.getElementById('meeting-instructions')) document.getElementById('meeting-instructions').value = '';

    const radioDefault = document.querySelector('input[name="availability-type"][value="weekly"]');
    if (radioDefault) {
        radioDefault.checked = true;
        gestisciTipoDisponibilitaTour('weekly');
    }
    if (document.getElementById('single-fixed-date-input')) {
        document.getElementById('single-fixed-date-input').value = '';
    }
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) fileInput.value = '';
    fotoItinerarioCorrenti = [];
    tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti'];
    orariCorrenti = [
        { time: '09:30', capacity: 15 },
        { time: '11:30', capacity: 15 },
        { time: '15:30', capacity: 15 },
        { time: '18:00', capacity: 15 }
    ];
    document.querySelectorAll('input[name="giorno-check"]').forEach(c => c.checked = true);
    const checkAll = document.getElementById('check-all-days');
    if (checkAll) checkAll.checked = true;

    const isConsigliatoEl = document.getElementById('is-consigliato');
    const isAllaModaEl = document.getElementById('is-alla-moda');
    if (isConsigliatoEl) isConsigliatoEl.checked = false;
    if (isAllaModaEl) isAllaModaEl.checked = false;

    puntiRaccoltaCorrenti = ['Piazzale Giotto', 'Piazza Politeama'];
    renderCampiPuntiRaccolta();
    renderGalleriaAnteprima();
    renderCampiTappe();
    renderCampiOrari();
    document.getElementById('form-title').textContent = '➕ Aggiungi Nuovo Itinerario';
    document.getElementById('save-btn').textContent = '💾 Salva Itinerario';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

async function eliminaItinerario(id) {
    if (!confirm('Sei sicuro di voler eliminare questo itinerario?')) return;

    let itinerari = getItinerari();
    itinerari = itinerari.filter(i => String(i.id) !== String(id));
    await saveItinerari(itinerari);

    if (String(document.getElementById('itinerary-id').value) === String(id)) {
        resetForm();
    }

    caricaElencoItinerari();
}

async function resetDemoData() {
    if (confirm('Sei sicuro di voler SBUOTARE e cancellare tutti gli itinerari presente?')) {
        await saveItinerari([]);
        resetForm();
        caricaElencoItinerari();
    }
}

async function pubblicaItinerariNelCloudManuale() {
    const itinerari = getItinerari();
    if (!itinerari || itinerari.length === 0) {
        alert("Nessun itinerario presente da pubblicare.");
        return;
    }

    if (window.cloudDB) {
        const ok = await window.cloudDB.salvaItinerariCloud(itinerari);
        if (ok) {
            alert(`☁️ TUTTI I ${itinerari.length} ITINERARI SONO STATI PUBBLICATI NEL CLOUD CON SUCCESSO!\n\nOra qualsiasi turista da qualsiasi cellulare, tablet o computer nel mondo vedrà i tuoi itinerari aggiornati.`);
        } else {
            alert("⚠️ Si è verificato un problema nella pubblicazione Cloud. Verifica la tua connessione internet.");
        }
    }
}

// TABELLA ORARI MODALE
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
            return { time: item, capacity: 15 };
        }
        if (item && typeof item === 'object' && item.time) {
            return { time: item.time, capacity: parseInt(item.capacity, 10) || 15 };
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
    const targetCapacity = inputCap ? (parseInt(inputCap.value, 10) || 15) : 15;

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
        orariCorrenti[index].capacity = parseInt(nuovaCapienza, 10) || 15;
        renderCampiOrari();
    }
}

function applicaPresetOrari(tipo) {
    if (tipo === 'reset') {
        orariCorrenti = [];
        renderCampiOrari();
    }
}

// BUILDER FOTO & TAPPE
function gestisciCaricamentoFotoMultiple(event) {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    let completati = 0;

    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.60);
                fotoItinerarioCorrenti.push(compressedDataUrl);

                completati++;
                if (completati === files.length) {
                    renderGalleriaAnteprima();
                    event.target.value = '';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function aggiungiUrlFoto() {
    const urlInput = document.getElementById('image-url');
    if (!urlInput) return;

    const url = urlInput.value.trim();
    if (url) {
        fotoItinerarioCorrenti.push(url);
        urlInput.value = '';
        renderGalleriaAnteprima();
    }
}

function rimuoviFotoGalleria(index) {
    fotoItinerarioCorrenti.splice(index, 1);
    renderGalleriaAnteprima();
}

function renderGalleriaAnteprima() {
    const container = document.getElementById('gallery-preview-container');
    if (!container) return;

    if (fotoItinerarioCorrenti.length === 0) {
        container.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; grid-column:1/-1;">Nessuna foto ancora aggiunta.</p>';
        return;
    }

    const htmlHeader = `<div style="grid-column:1/-1; font-weight:bold; font-size:0.85rem; color:#1b4f72;">🖼️ ${fotoItinerarioCorrenti.length} foto pronte per la galleria del tour:</div>`;

    container.innerHTML = htmlHeader + fotoItinerarioCorrenti.map((imgUrl, index) => `
        <div class="gallery-thumb-item">
            <img src="${imgUrl}" alt="Foto ${index + 1}">
            <button type="button" class="gallery-thumb-remove" onclick="rimuoviFotoGalleria(${index})" title="Rimuovi foto">✕</button>
        </div>
    `).join('');
}

function renderCampiTappe() {
    const container = document.getElementById('tappe-input-list');
    if (!container) return;

    if (tappeCorrenti.length === 0) {
        tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti storici'];
    }

    container.innerHTML = tappeCorrenti.map((tappaText, idx) => `
        <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-weight: bold; font-size: 0.85rem; color: #e67e22; width: 24px; text-align: center;">${idx + 1}.</span>
            <input type="text" class="tappa-input" value="${escapeHtmlAdmin(tappaText)}" placeholder="Es. Tappa ${idx + 1}" oninput="aggiornaTappa(${idx}, this.value)" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
            ${tappeCorrenti.length > 1 ? `<button type="button" class="btn-danger btn-small" onclick="rimuoviCampoTappa(${idx})" title="Rimuovi tappa">✕</button>` : ''}
        </div>
    `).join('');
}

function aggiornaTappa(index, val) {
    tappeCorrenti[index] = val;
}

function aggiungiCampoTappa() {
    tappeCorrenti.push('');
    renderCampiTappe();
    setTimeout(() => {
        const inputs = document.querySelectorAll('.tappa-input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }, 50);
}

function rimuoviCampoTappa(index) {
    tappeCorrenti.splice(index, 1);
    renderCampiTappe();
}

function escapeHtmlAdmin(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#032;");
}
