/**
 * MODULO 1.4: Salvataggio, Modifica, Eliminazione e Pubblicazione Cloud Itinerari
 * Sicily Palermo Tour - Admin Itinerari
 */

function pulisciVecchiItinerariDemo(lista) {
    if (!Array.isArray(lista)) return [];
    return lista.filter(item => {
        if (!item) return false;
        const title = String(item.title || '').toLowerCase().trim();
        if (!title) return false;
        if (title === 'dsf' || title === 'sdf' || title === 'fds' || title === 'asdf') return false;
        return true;
    });
}

function getItinerari() {
    let saved = localStorage.getItem(STORAGE_KEY);
    let list = [];
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) list = pulisciVecchiItinerariDemo(parsed);
        } catch (e) {
            list = [];
        }
    }
    return list;
}

async function saveItinerari(itinerari) {
    const cleanList = pulisciVecchiItinerariDemo(itinerari);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));

    if (typeof caricaItinerari === 'function') {
        const cat = typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti';
        try {
            caricaItinerari(cat);
        } catch (e) {
            console.warn("Avviso aggiornamento vista itinerari:", e);
        }
    }
    if (window.consigliatiModaManager) {
        window.consigliatiModaManager.renderSezioni();
    }
    window.dispatchEvent(new Event('spt_data_updated'));

    try {
        if (window.cloudAdmin && window.cloudAdmin.isAuthorized()) {
            await window.cloudAdmin.salvaItinerariAdmin(cleanList);
        } else if (window.cloudDB) {
            await window.cloudDB.salvaItinerariCloud(cleanList);
        }
    } catch (err) {
        console.error("Errore invio itinerari al Cloud:", err);
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

function sincronizzaCheckBus(checked) {
    const mainCheck = document.getElementById('shared-bus-capacity-main-check');
    const modalCheck = document.getElementById('shared-bus-capacity-check');
    if (mainCheck) mainCheck.checked = checked;
    if (modalCheck) modalCheck.checked = checked;
}

function aggiornaEtichettaDataFissaLeggibile(isoStr) {
    const badge = document.getElementById('single-fixed-date-readable');
    if (!badge) return;

    if (!isoStr) {
        badge.style.display = 'none';
        badge.textContent = '';
        return;
    }

    const parts = String(isoStr).split('-');
    if (parts.length === 3) {
        const y = parts[0];
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);

        const monthNamesIt = [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ];

        if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
            badge.textContent = `📅 Data confermata: ${d} ${monthNamesIt[m]} ${y}`;
            badge.style.display = 'inline-block';
            return;
        }
    }

    badge.style.display = 'none';
}
window.aggiornaEtichettaDataFissaLeggibile = aggiornaEtichettaDataFissaLeggibile;

function gestisciTipoDisponibilitaTour(type) {
    const boxDate = document.getElementById('box-single-fixed-date');
    if (!boxDate) return;

    if (type === 'singleDate') {
        boxDate.classList.remove('hidden');
        boxDate.style.display = 'block';
        const dateInput = document.getElementById('single-fixed-date-input');
        if (dateInput) {
            if (dateInput.value) {
                aggiornaEtichettaDataFissaLeggibile(dateInput.value);
            }
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

    const sharedBusCheck = document.getElementById('shared-bus-capacity-main-check') || document.getElementById('shared-bus-capacity-check');
    const sharedBusCapacity = sharedBusCheck ? sharedBusCheck.checked : false;

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
                return { id, title, category, duration, price, meetingPoint, pickupPoints, meetingInstructions, availabilityType, singleFixedDate, sharedBusCapacity, availableDays, timeSlots, maxCapacity, featured, isConsigliato, isAllaModa, imageUrl, images, tappe, servizi, shortDesc, fullDesc };
            }
            return item;
        });
    } else {
        const nuovoItinerario = {
            id: Date.now().toString(),
            title, category, duration, price, meetingPoint, pickupPoints, meetingInstructions, availabilityType, singleFixedDate, sharedBusCapacity, availableDays, timeSlots, maxCapacity, featured, isConsigliato, isAllaModa, imageUrl, images, tappe, servizi, shortDesc, fullDesc
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
        const val = item.singleFixedDate || '';
        document.getElementById('single-fixed-date-input').value = val;
        aggiornaEtichettaDataFissaLeggibile(val);
    }
    sincronizzaCheckBus(!!item.sharedBusCapacity);
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
            { time: '10:00', capacity: 53 }
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
        aggiornaEtichettaDataFissaLeggibile('');
    }
    sincronizzaCheckBus(false);
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) fileInput.value = '';
    fotoItinerarioCorrenti = [];
    tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti'];
    orariCorrenti = [
        { time: '10:00', capacity: 53 }
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

window.getItinerari = getItinerari;
window.saveItinerari = saveItinerari;
window.caricaElencoItinerari = caricaElencoItinerari;
window.preparaModifica = preparaModifica;
window.annullaModifica = annullaModifica;
window.resetForm = resetForm;
window.salvaItinerario = salvaItinerario;
window.eliminaItinerario = eliminaItinerario;
window.resetDemoData = resetDemoData;
window.pubblicaItinerariNelCloudManuale = pubblicaItinerariNelCloudManuale;
window.toggleTuttiGiorni = toggleTuttiGiorni;
window.sincronizzaCheckBus = sincronizzaCheckBus;
window.gestisciTipoDisponibilitaTour = gestisciTipoDisponibilitaTour;
