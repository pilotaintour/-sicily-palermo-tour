/**
 * Gestione Dati e Rendering Itinerari con Carosello Foto e Timeline Tappe - Sicily Palermo Tour
 */

const STORAGE_KEY = 'spt_itineraries';

// Traccia l'indice della foto corrente nel carosello per ciascun tour
const indiciCarosello = {};

// Itinerari Iniziali Predefiniti (Vuoti per lasciare spazio solo agli itinerari reali creati dall'Admin)
const DEFAULT_ITINERARIES = [];

let itinerarioSelezionatoAttuale = null;
let categoriaSelezionata = 'Tutti';

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

// Recupera gli itinerari aggiornati dal localStorage
function getItinerari() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        return [];
    }
    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? pulisciVecchiItinerariDemo(parsed) : [];
    } catch (e) {
        return [];
    }
}

// Genera l'HTML del Carosello Foto per una card o per la modale
function generaHtmlCarosello(tour, prefissoId = 'card') {
    const fotoList = (tour.images && tour.images.length > 0) ? tour.images : [tour.imageUrl || 'https://via.placeholder.com/400x220?text=Palermo+Tour'];
    const tourId = tour.id;

    if (!indiciCarosello[prefissoId + '_' + tourId]) {
        indiciCarosello[prefissoId + '_' + tourId] = 0;
    }

    const currentIndex = indiciCarosello[prefissoId + '_' + tourId];
    const currentImg = fotoList[currentIndex] || fotoList[0];
    const haPiuFoto = fotoList.length > 1;

    let html = `
        <div class="card-img-container" id="${prefissoId}-container-${tourId}">
            <img class="carousel-img" id="${prefissoId}-img-${tourId}" src="${currentImg}" alt="${escapeHtml(tour.title)}" onerror="this.src='https://via.placeholder.com/400x220?text=Foto+Tour'">
    `;

    if (haPiuFoto) {
        html += `
            <button type="button" class="carousel-nav-btn prev" onclick="scorriCarosello('${tourId}', -1, '${prefissoId}', event)" title="Foto precedente">❮</button>
            <button type="button" class="carousel-nav-btn next" onclick="scorriCarosello('${tourId}', 1, '${prefissoId}', event)" title="Foto successiva">❯</button>
            <div class="carousel-dots">
                ${fotoList.map((_, i) => `
                    <span class="carousel-dot ${i === currentIndex ? 'active' : ''}" onclick="vaiAFotoIndex('${tourId}', ${i}, '${prefissoId}', event)"></span>
                `).join('')}
            </div>
        `;
    }

    html += `</div>`;
    return html;
}

// Scorre le foto del carosello
function scorriCarosello(tourId, direzione, prefissoId = 'card', event) {
    if (event) event.stopPropagation();

    const itinerari = getItinerari();
    const tour = itinerari.find(t => String(t.id) === String(tourId));
    if (!tour) return;

    const fotoList = (tour.images && tour.images.length > 0) ? tour.images : [tour.imageUrl];
    const key = prefissoId + '_' + tourId;

    if (typeof indiciCarosello[key] === 'undefined') {
        indiciCarosello[key] = 0;
    }

    let nextIndex = indiciCarosello[key] + direzione;
    if (nextIndex < 0) {
        nextIndex = fotoList.length - 1;
    } else if (nextIndex >= fotoList.length) {
        nextIndex = 0;
    }

    indiciCarosello[key] = nextIndex;
    aggiornaVistaCarosello(tourId, prefissoId, fotoList, nextIndex);
}

// Salta direttamente a un'immagine del carosello tramite pallino
function vaiAFotoIndex(tourId, index, prefissoId = 'card', event) {
    if (event) event.stopPropagation();

    const itinerari = getItinerari();
    const tour = itinerari.find(t => String(t.id) === String(tourId));
    if (!tour) return;

    const fotoList = (tour.images && tour.images.length > 0) ? tour.images : [tour.imageUrl];
    const key = prefissoId + '_' + tourId;

    indiciCarosello[key] = index;
    aggiornaVistaCarosello(tourId, prefissoId, fotoList, index);
}

// Aggiorna l'immagine e i pallini attivi
function aggiornaVistaCarosello(tourId, prefissoId, fotoList, newIndex) {
    const imgElement = document.getElementById(`${prefissoId}-img-${tourId}`);
    if (imgElement) {
        imgElement.style.opacity = '0.3';
        setTimeout(() => {
            imgElement.src = fotoList[newIndex];
            imgElement.style.opacity = '1';
        }, 150);
    }

    const container = document.getElementById(`${prefissoId}-container-${tourId}`);
    if (container) {
        const dots = container.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            if (i === newIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

// Carica e renderizza la griglia degli itinerari con sincronizzazione Cloud
function caricaItinerari(categoria = 'Tutti') {
    categoriaSelezionata = categoria;
    const itinerari = getItinerari();
    renderItinerariGrid(itinerari, categoria);

    if (window.cloudDB) {
        window.cloudDB.fetchItinerariCloud().then(cloudList => {
            if (cloudList && Array.isArray(cloudList) && cloudList.length > 0) {
                renderItinerariGrid(cloudList, categoria);
            }
        });
    }
}

// Scorre lo slider orizzontale della griglia tour GetYourGuide
function scorriSliderOrizzontale(containerId, offset) {
    const el = document.getElementById(containerId);
    if (el) {
        el.scrollBy({ left: offset, behavior: 'smooth' });
    }
}

function renderItinerariGrid(itinerariList, categoria) {
    const grid = document.getElementById('itinerari-grid');
    if (!grid) return;

    const filtrati = categoria === 'Tutti'
        ? itinerariList
        : itinerariList.filter(i => i.category === categoria);

    if (filtrati.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                <h3>Nessun itinerario trovato per la categoria "${escapeHtml(categoria)}"</h3>
                <p>Prova a selezionare una categoria diversa o torna tra poco!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtrati.map(tour => `
        <div class="card">
            ${generaHtmlCarosello(tour, 'card')}
            <div class="card-content">
                <div class="badges-row">
                    <span class="badge">${escapeHtml(tour.category)}</span>
                    ${tour.images && tour.images.length > 1 ? `<span class="badge" style="background:#e0f2fe; color:#0369a1;">📷 ${tour.images.length} Foto</span>` : ''}
                    ${String(tour.featured) === 'true' ? '<span class="badge badge-star">⭐ In Evidenza</span>' : ''}
                </div>
                <h3>${escapeHtml(tour.title)}</h3>
                <p class="card-desc">${escapeHtml(tour.shortDesc || tour.shortDescription || tour.fullDescription || '')}</p>
                <div class="card-chips">
                    <span>⏱️ ${escapeHtml(tour.duration || 'Flessibile')}</span>
                    <span>💰 ${escapeHtml(tour.price || 'Su richiesta')}</span>
                </div>
                <div class="card-footer">
                    <button type="button" class="btn-tour" onclick="apriDettagliModal('${tour.id}')">🎟️ Dettagli &amp; Prenota</button>
                </div>
            </div>
        </div>
    `).join('');

    if (typeof aggiornaTraduzioneDinamica === 'function') {
        aggiornaTraduzioneDinamica();
    }
}

// Gestione dei bottoni filtro categoria
function filtraCategoria(categoria, btnElement) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (btnElement) {
        btnElement.classList.add('active');
    }

    caricaItinerari(categoria);
}

// Apre la finestra modale con le tappe e il carosello dell'itinerario
function apriDettagliModal(id) {
    try {
        const itinerari = getItinerari();
        const tour = itinerari.find(t => String(t.id) === String(id)) || itinerari[0];

        if (!tour) return;

        itinerarioSelezionatoAttuale = tour;

        // Renderizza il carosello nella modale
        const modalCoverBox = document.getElementById('modal-cover-box');
        if (modalCoverBox) {
            modalCoverBox.innerHTML = generaHtmlCarosello(tour, 'modal');
        }

        const badgeEl = document.getElementById('modal-badge');
        if (badgeEl) badgeEl.textContent = tour.category || 'Tour';

        const featuredBadge = document.getElementById('modal-featured');
        if (featuredBadge) {
            if (String(tour.featured) === 'true') {
                featuredBadge.classList.remove('hidden');
            } else {
                featuredBadge.classList.add('hidden');
            }
        }

        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.textContent = tour.title || '';

        // Popola Box Dettagli Pratici
        const durationEl = document.getElementById('modal-duration');
        const priceEl = document.getElementById('modal-price');
        const meetingEl = document.getElementById('modal-meeting');

        if (durationEl) durationEl.textContent = tour.duration || 'Flessibile';
        if (priceEl) priceEl.textContent = tour.price || 'Su richiesta';
        if (meetingEl) meetingEl.textContent = tour.meetingPoint || 'Palermo Centro';

        // Renderizza Box Punti di Raccolta & Ritrovo Mappa con Selettore
        const modalPickupBox = document.getElementById('modal-pickup-box');
        if (modalPickupBox) {
            // Estrai tutti i punti di raccolta singoli e puliti
            const tuttiPunti = [];

            if (tour.meetingPoint) {
                tour.meetingPoint.split('•').forEach(s => {
                    const clean = s.trim();
                    if (clean && !tuttiPunti.includes(clean)) tuttiPunti.push(clean);
                });
            }

            if (tour.pickupPoints) {
                const arr = Array.isArray(tour.pickupPoints) ? tour.pickupPoints : (typeof tour.pickupPoints === 'string' ? tour.pickupPoints.split('•') : []);
                arr.forEach(s => {
                    if (typeof s === 'string') {
                        s.split('•').forEach(sub => {
                            const clean = sub.trim();
                            if (clean && !tuttiPunti.includes(clean)) tuttiPunti.push(clean);
                        });
                    }
                });
            }

            if (tuttiPunti.length === 0) tuttiPunti.push('Palermo Centro');

            const instructions = tour.meetingInstructions || '';

            let selectOptionsHtml = tuttiPunti.map((p, idx) => `
                <option value="${escapeHtml(p)}" ${idx === 0 ? 'selected' : ''}>
                    📍 ${escapeHtml(p)}
                </option>
            `).join('');

            let pickupHtml = `
                <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 14px; padding: 18px; margin-bottom: 22px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.06);">
                    <h4 style="margin: 0 0 10px 0; color: #0369a1; font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                        🗺️ Punti di Raccolta &amp; Ritrovo
                    </h4>

                    <!-- Lista Bottoni dei Punti di Raccolta per Selezione Veloce -->
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
                        ${tuttiPunti.map(p => `
                            <button type="button" onclick="selezionaPuntoMappa('${escapeHtml(p)}')" style="background: #ffffff; border: 1.5px solid #0284c7; color: #0369a1; padding: 7px 14px; border-radius: 20px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(2,132,199,0.1); transition: all 0.2s ease;">
                                🚌 ${escapeHtml(p)}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Domanda / Selettore del punto da vedere sulla mappa -->
                    <div style="background: #ffffff; border: 1.5px solid #0284c7; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                        <label for="select-tour-map-point" style="display: block; font-weight: 800; color: #0b2545; font-size: 0.92rem; margin-bottom: 6px;">
                            📍 Quale punto di raccolta desideri vedere sulla mappa?
                        </label>
                        <select id="select-tour-map-point" onchange="aggiornaMappaTourSelezionato(this.value)" style="width: 100%; padding: 10px; border: 1.5px solid #0284c7; border-radius: 8px; font-size: 0.95rem; font-weight: 700; color: #0b2545; background: #ffffff; cursor: pointer;">
                            ${selectOptionsHtml}
                        </select>
                    </div>

                    <!-- Contenitore della Mappa Visiva -->
                    <div id="tour-live-map-container" style="width: 100%; height: 260px; border-radius: 10px; overflow: hidden; border: 1px solid #cbd5e1; margin-bottom: 12px; background: #f1f5f9;">
                        <!-- Caricato via JS -->
                    </div>

                    <!-- Link Navigatore GPS -->
                    <div style="text-align: center;">
                        <a id="tour-gps-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tuttiPunti[0] + ', Palermo')}" target="_blank" style="background: #0284c7; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 0.88rem; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
                            🧭 Avvia Navigatore GPS per ${escapeHtml(tuttiPunti[0])}
                        </a>
                    </div>

                    ${instructions ? `
                        <div style="font-size: 0.88rem; color: #475569; background: #ffffff; padding: 10px 12px; border-radius: 8px; border-left: 3px solid #0284c7; margin-top: 12px;">
                            🎒 <strong>Indicazioni per il Ritrovo:</strong> ${escapeHtml(instructions)}
                        </div>
                    ` : ''}
                </div>
            `;

            modalPickupBox.innerHTML = pickupHtml;

            // Inizializza la mappa con il primo punto singolo
            setTimeout(() => {
                aggiornaMappaTourSelezionato(tuttiPunti[0]);
            }, 100);
        }

        // Binda il pulsante di prenotazione con calendario
        const btnCalFooter = document.getElementById('btn-modal-prenota-calendario');
        if (btnCalFooter) {
            btnCalFooter.onclick = () => vaiAllaPaginaPrenotazione(tour.id);
        }

        // Genera la Timeline delle Tappe
        const modalTimeline = document.getElementById('modal-timeline');
        const modalDescText = document.getElementById('modal-description-text');

        if (modalDescText) {
            modalDescText.textContent = tour.fullDesc || tour.shortDesc || '';
        }

        if (modalTimeline) {
            let tappeList = [];
            if (tour.tappe && Array.isArray(tour.tappe) && tour.tappe.length > 0) {
                tappeList = tour.tappe;
            } else {
                // Parsea righe numerate dalla descrizione se presenti
                const fullText = tour.fullDesc || tour.shortDesc || '';
                const righe = fullText.split('\n').filter(r => r.trim() !== '');
                righe.forEach(riga => {
                    const trimmed = riga.trim();
                    if (/^(\d+[\.\)-]|-|\*)/.test(trimmed)) {
                        const pulita = trimmed.replace(/^(\d+[\.\)-]|-|\*)\s*/, '');
                        if (pulita) tappeList.push(pulita);
                    }
                });
            }

            if (tappeList.length > 0) {
                modalTimeline.innerHTML = tappeList.map((tappa, idx) => `
                    <div class="timeline-step">
                        <span class="step-number">${idx + 1}</span>
                        <span class="step-text">${escapeHtml(tappa)}</span>
                    </div>
                `).join('');
            } else {
                modalTimeline.innerHTML = `
                    <div class="timeline-step">
                        <span class="step-number">1</span>
                        <span class="step-text">Incontro con la guida e partenza per il tour "${escapeHtml(tour.title || '')}"</span>
                    </div>
                    <div class="timeline-step">
                        <span class="step-number">2</span>
                        <span class="step-text">Passeggiata tra i luoghi storici, monumenti e punti di interesse del percorso</span>
                    </div>
                    <div class="timeline-step">
                        <span class="step-number">3</span>
                        <span class="step-text">Conclusione dell'itinerario e consigli personalizzati su cosa visitare a Palermo</span>
                    </div>
                `;
            }
        }

        // Renderizza Servizi Inclusi e Caratteristiche Tour separati con Emoticon
        const servicesBox = document.getElementById('modal-services-box');
        if (servicesBox) {
            const listaTutti = (tour.servizi && tour.servizi.length > 0)
                ? tour.servizi
                : ['Guida Turistica Autorizzata', 'Assicurazione Tour Inclusa', 'Assistenza Dedicata WhatsApp', 'Cancellazione Gratuita', 'Adatto a Famiglie & Bambini'];

            const tagsCaratteristicheList = [
                'Adatto a Famiglie', 'Adatto a Famiglie & Bambini',
                'Accessibile Sedia a Rotelle', 'Pet Friendly (Animali Ammessi)',
                'Camminata Facile Pianeggiante', 'Tour Multilingua (ITA/ENG)'
            ];

            const serviziEffettivi = [];
            const caratteristicheEffettive = [];

            listaTutti.forEach(s => {
                if (tagsCaratteristicheList.some(tag => s.includes(tag) || tag.includes(s))) {
                    caratteristicheEffettive.push(s);
                } else {
                    serviziEffettivi.push(s);
                }
            });

            function aggiungiEmoticonServizio(testo) {
                if (testo.includes('Guida')) return '🚩 ' + testo;
                if (testo.includes('Accompagnatore')) return '🧳 ' + testo;
                if (testo.includes('Degustazion') || testo.includes('Food') || testo.includes('Cibo')) return '🥙 ' + testo;
                if (testo.includes('Ingressi') || testo.includes('Monumenti')) return '🎟️ ' + testo;
                if (testo.includes('Auricolari') || testo.includes('Whisper')) return '🎧 ' + testo;
                if (testo.includes('Trasporto') || testo.includes('Transfer')) return '🚌 ' + testo;
                if (testo.includes('Assicurazione')) return '🛡️ ' + testo;
                if (testo.includes('WhatsApp') || testo.includes('Assistenza')) return '💬 ' + testo;
                if (testo.includes('Cancellazione')) return '🔄 ' + testo;
                return '✓ ' + testo;
            }

            function aggiungiEmoticonCaratteristica(testo) {
                if (testo.includes('Famigli') || testo.includes('Bambini')) return '👨‍👩‍👧‍👦 ' + testo;
                if (testo.includes('Rotelle') || testo.includes('Disabili')) return '♿ ' + testo;
                if (testo.includes('Pet') || testo.includes('Animali')) return '🐾 ' + testo;
                if (testo.includes('Camminata') || testo.includes('Facile')) return '🚶 ' + testo;
                if (testo.includes('Multilingua') || testo.includes('ITA')) return '🌐 ' + testo;
                return '🏷️ ' + testo;
            }

            let htmlServiziBox = '';

            if (serviziEffettivi.length > 0) {
                htmlServiziBox += `
                    <div style="margin-bottom: 14px;">
                        <strong style="color: #0b2545; display: block; margin-bottom: 8px; font-size: 0.95rem;">✓ Servizi Inclusi nel Prezzo:</strong>
                        <div class="services-chips" style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${serviziEffettivi.map(s => `<span class="service-chip" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-weight:600;">${escapeHtml(aggiungiEmoticonServizio(s))}</span>`).join('')}
                        </div>
                    </div>
                `;
            }

            if (caratteristicheEffettive.length > 0) {
                htmlServiziBox += `
                    <div>
                        <strong style="color: #c2410c; display: block; margin-bottom: 8px; font-size: 0.95rem;">🏷️ Caratteristiche & Suggerimenti Tour:</strong>
                        <div class="services-chips" style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${caratteristicheEffettive.map(c => `<span class="service-chip" style="background:#fffbf5; color:#c2410c; border:1px solid #fed7aa; font-weight:600;">${escapeHtml(aggiungiEmoticonCaratteristica(c))}</span>`).join('')}
                        </div>
                    </div>
                `;
            }

            servicesBox.innerHTML = htmlServiziBox;
        }

        const modalOverlay = document.getElementById('modal-dettaglio');
        if (modalOverlay) {
            modalOverlay.classList.remove('hidden');
            modalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        if (typeof aggiornaTraduzioneDinamica === 'function') {
            aggiornaTraduzioneDinamica();
        }
    } catch (err) {
        console.error("Errore nell'apertura della modale:", err);
    }
}

// Chiude la finestra modale
function chiudiModal(event) {
    const modal = document.getElementById('modal-dettaglio');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Reindirizza alla pagina di prenotazione completa con calendario
function vaiAllaPaginaPrenotazione(id) {
    const tourId = id || (itinerarioSelezionatoAttuale ? itinerarioSelezionatoAttuale.id : '1');
    window.location.href = `prenotazioni/prenotazione.html?tourId=${encodeURIComponent(tourId)}`;
}

// Precompila il form di contatto dalla modale
function prenotaTourModal() {
    if (!itinerarioSelezionatoAttuale) return;

    chiudiModal();

    const messaggioInput = document.getElementById('messaggio');
    if (messaggioInput) {
        messaggioInput.value = `Salve! Desidero maggiori informazioni o prenotare l'itinerario: "${itinerarioSelezionatoAttuale.title}".`;
    }

    const contattiSection = document.getElementById('contatti');
    if (contattiSection) {
        contattiSection.scrollIntoView({ behavior: 'smooth' });
    }
    const nomeInput = document.getElementById('nome');
    if (nomeInput) {
        nomeInput.focus();
    }
}

// Helper sicurezza HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#032;");
}

// Aggiorna la mappa visiva e il pulsante GPS in base al punto di raccolta selezionato dal turista nella modale
function selezionaPuntoMappa(puntoNome) {
    const select = document.getElementById('select-tour-map-point');
    if (select) {
        select.value = puntoNome;
    }
    aggiornaMappaTourSelezionato(puntoNome);
}

function aggiornaMappaTourSelezionato(puntoNome) {
    const mapContainer = document.getElementById('tour-live-map-container');
    const gpsLink = document.getElementById('tour-gps-link');

    if (!puntoNome) puntoNome = 'Palermo Centro';

    if (mapContainer) {
        if (window.mapsService) {
            mapContainer.innerHTML = window.mapsService.getGoogleEmbedIframeHtml(puntoNome, { height: '260px' });
        } else {
            const query = encodeURIComponent(puntoNome + ', Palermo, Italia');
            mapContainer.innerHTML = `<iframe width="100%" height="260" style="border:0; border-radius:10px;" loading="lazy" src="https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe>`;
        }
    }

    if (gpsLink) {
        const query = encodeURIComponent(puntoNome + ', Palermo, Italia');
        gpsLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
        gpsLink.innerHTML = `🧭 Avvia Navigatore GPS per <strong>${escapeHtml(puntoNome)}</strong>`;
    }
}

// Genera e apre la scheda PDF stampabile dell'itinerario selezionato
function scaricaProgrammaTourPDF() {
    if (!itinerarioSelezionatoAttuale) return;

    const tour = itinerarioSelezionatoAttuale;
    const printWin = window.open('', '_blank', 'width=880,height=950');
    if (!printWin) {
        alert('⚠️ Per favore abilita i popup nel tuo browser per scaricare il PDF del programma.');
        return;
    }

    const tappeList = (tour.tappe && Array.isArray(tour.tappe) && tour.tappe.length > 0)
        ? tour.tappe
        : ['Incontro con la guida nel punto stabilito', 'Passeggiata guidata e visita ai monumenti storici', 'Conclusione del tour e consigli personalizzati'];

    const pickupList = (tour.pickupPoints && Array.isArray(tour.pickupPoints) && tour.pickupPoints.length > 0)
        ? tour.pickupPoints.join(' • ')
        : (tour.meetingPoint || 'Palermo Centro');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <title>Programma Tour - ${escapeHtml(tour.title)}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 35px; color: #0f172a; line-height: 1.65; background: #ffffff; }
                .header { text-align: center; border-bottom: 2.5px solid #0b2545; padding-bottom: 18px; margin-bottom: 25px; }
                .header img { max-width: 280px; height: auto; margin-bottom: 12px; }
                .title { color: #0b2545; font-size: 1.85rem; font-weight: 800; margin: 0 0 8px 0; }
                .badge-row { display: flex; justify-content: center; gap: 20px; font-weight: 700; color: #0369a1; margin-bottom: 10px; font-size: 0.95rem; }
                .box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px 22px; margin-bottom: 22px; }
                .box-title { color: #0b2545; font-size: 1.12rem; font-weight: 800; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
                .timeline-item { margin-bottom: 10px; display: flex; align-items: flex-start; gap: 12px; font-size: 0.95rem; }
                .num { background: #0b2545; color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem; flex-shrink: 0; margin-top: 2px; }
                .footer { text-align: center; font-size: 0.88rem; color: #64748b; border-top: 1.5px solid #cbd5e1; padding-top: 18px; margin-top: 35px; line-height: 1.6; }
                @media print { .no-print { display: none !important; } }
            </style>
        </head>
        <body>
            <div class="no-print" style="text-align:center; margin-bottom:25px;">
                <button onclick="window.print()" style="background:#0b2545; color:white; border:none; padding:14px 28px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:1.05rem; box-shadow: 0 4px 14px rgba(11,37,69,0.3);">🖨️ Stampa / Salva in PDF</button>
            </div>

            <div class="header">
                <img src="${window.location.origin + window.location.pathname.replace('index.html', '')}logo.svg" alt="Sicily Palermo Tour">
                <h1 class="title">${escapeHtml(tour.title)}</h1>
                <div class="badge-row">
                    <span>🏛️ Categoria: ${escapeHtml(tour.category || 'Tour')}</span>
                    <span>⏱️ Durata: ${escapeHtml(tour.duration || '3 Ore')}</span>
                    <span>💰 Prezzo: ${escapeHtml(tour.price || 'Da 25€')}</span>
                </div>
            </div>

            <div class="box">
                <div class="box-title">📍 Punti d'Incontro &amp; Raccolta</div>
                <p><strong>Ritrovo &amp; Raccolta:</strong> ${escapeHtml(pickupList)}</p>
                ${tour.meetingInstructions ? `<p style="margin-top:8px; color:#334155;"><strong>🎒 Note per il Ritrovo:</strong> ${escapeHtml(tour.meetingInstructions)}</p>` : ''}
            </div>

            <div class="box">
                <div class="box-title">📖 Panoramica del Tour</div>
                <p style="white-space: pre-wrap; font-size:0.95rem; color:#334155;">${escapeHtml(tour.fullDesc || tour.shortDesc || '')}</p>
            </div>

            <div class="box">
                <div class="box-title">📍 Tappe e Punti di Interesse dell'Itinerario</div>
                ${tappeList.map((tappa, idx) => `
                    <div class="timeline-item">
                        <span class="num">${idx + 1}</span>
                        <span>${escapeHtml(tappa)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="footer">
                <strong>Sicily Palermo Tour</strong> - PI 07150890825<br>
                Info &amp; Prenotazioni: 📞 +39 340 1234567 | ✉️ pilotaintour13@gmail.com | 🌐 https://sicilypalermotours.com
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 400);
                };
            </script>
        </body>
        </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
}
