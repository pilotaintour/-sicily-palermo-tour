/**
 * MODULO AUTONOMO ARCHIVIO STORICO PER CARTELLE ITINERARIO
 * Sicily Palermo Tour - Admin
 * Organizza i tour passati in Cartelle per Itinerario (es. Itinerario Mare, Itinerario Rossano).
 * Cliccando su un itinerario si vedono unicamente le date, gli orari ed I NOMI COMPLETI dei passeggeri passati.
 */

class AdminArchivioManager {
    constructor() {
        this.tourSelezionatoArchivio = null; // null = Griglia Cartelle Archivio; string = Titolo Tour aperto
    }

    // Controlla se la data e l'orario di una prenotazione sono antecedenti ad oggi
    isPrenotazionePassata(b) {
        if (!b) return false;
        const dateStr = b.dateISO || b.dateReadable || '';
        if (!dateStr) return false;

        try {
            let y, m, d;
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                y = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10) - 1;
                d = parseInt(parts[2], 10);
            } else if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                d = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10) - 1;
                y = parseInt(parts[2], 10);
            } else {
                return false;
            }

            const timeParts = (b.time || b.slotTime || '23:59').split(':');
            const hh = parseInt(timeParts[0], 10) || 0;
            const mm = parseInt(timeParts[1], 10) || 0;

            const dateBooking = new Date(y, m, d, hh, mm, 59, 999);
            const oggiInizio = new Date();
            oggiInizio.setHours(0, 0, 0, 0);

            // Considera archiviata SOLTANTO se il giorno dell'evento è strettamente antecedente ad oggi
            return dateBooking < oggiInizio;
        } catch (e) {
            return false;
        }
    }

    // Separa le prenotazioni in Attive (prossime) ed Archiviate (passate)
    separaPrenotazioni(allBookings) {
        const attive = [];
        const passate = [];

        if (!Array.isArray(allBookings)) return { attive: [], passate: [] };

        allBookings.forEach(b => {
            if (this.isPrenotazionePassata(b)) {
                passate.push(b);
            } else {
                attive.push(b);
            }
        });

        return { attive, passate };
    }

    // Apre la cartella dell'archivio per uno specifico itinerario
    apriCartellaArchivio(titoloTour) {
        this.tourSelezionatoArchivio = titoloTour;
        if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
    }

    // Torna alla griglia delle cartelle dell'Archivio
    chiudiCartellaArchivio() {
        this.tourSelezionatoArchivio = null;
        if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
    }

    // Renderizza la Sezione Archivio
    renderSezioneArchivio(passateList) {
        if (!Array.isArray(passateList) || passateList.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 15px;">
                    <h3 style="color: #0b2545; margin-top: 0;">🗄️ L'Archivio Storico è vuoto</h3>
                    <p>I tour e gli orari già conclusi nei giorni passati verranno archiviati qui automaticamente.</p>
                </div>
            `;
        }

        // SCENARIO 1: Nessuna cartella archivio aperta -> Mostra Griglia Cartelle Archivio per Itinerario
        if (!this.tourSelezionatoArchivio) {
            return this.renderGrigliaCartelleArchivio(passateList);
        }

        // SCENARIO 2: Cartella Archivio aperta -> Mostra solo i tour passati con LA LISTA NOMI COMPLETA di quell'Itinerario
        const passateDelTour = passateList.filter(b => b.tourTitle === this.tourSelezionatoArchivio);
        return this.renderDettaglioCartellaArchivio(this.tourSelezionatoArchivio, passateDelTour);
    }

    // Renderizza la Griglia delle Cartelle Archivio (es. Itinerario Mare, Itinerario Rossano)
    renderGrigliaCartelleArchivio(passateList) {
        let itinerariConfig = [];
        try {
            itinerariConfig = JSON.parse(localStorage.getItem('spt_itineraries') || '[]');
        } catch (e) {}

        const tourMappa = {};

        passateList.forEach(b => {
            const title = b.tourTitle || 'Tour Palermo';
            if (!tourMappa[title]) {
                tourMappa[title] = {
                    title: title,
                    countBookings: 0,
                    totalPassengers: 0,
                    dateSet: new Set()
                };
            }
            tourMappa[title].countBookings++;
            const numPasseggeri = (b.participantsList && b.participantsList.length > 0) ? b.participantsList.length : ((parseInt(b.adults, 10) || 1) + (parseInt(b.children, 10) || 0));
            tourMappa[title].totalPassengers += numPasseggeri;
            if (b.dateReadable || b.dateISO) tourMappa[title].dateSet.add(b.dateReadable || b.dateISO);
        });

        const titoliMappa = Object.keys(tourMappa);

        let html = `
            <div style="margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="color: #0b2545; margin: 0; font-size: 1.25rem;">🗄️ Cartelle Archivio Storico per Itinerario</h3>
                    <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">Clicca su un itinerario per accedere alla lista completa dei nomi dei passeggeri passati.</p>
                </div>
                <button type="button" class="btn-danger btn-small" onclick="adminArchivio.svuotaTuttoArchivio()">
                    🗑️ Svuota Tutto l'Archivio
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        `;

        titoliMappa.forEach(title => {
            const itemTour = tourMappa[title];
            const config = itinerariConfig.find(i => i.title === title) || {};
            const coverImg = (config.images && config.images.length > 0) ? config.images[0] : (config.imageUrl || 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=600');

            html += `
                <div onclick="adminArchivio.apriCartellaArchivio('${escapeHtmlBooking(title)}')" style="background: #ffffff; border: 2px solid #64748b; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.04); cursor: pointer; transition: all 0.25s ease;" onmouseover="this.style.borderColor='#0b2545'; this.style.transform='translateY(-3px)';" onmouseout="this.style.borderColor='#64748b'; this.style.transform='none';">
                    <div style="height: 125px; overflow: hidden; position: relative;">
                        <img src="${coverImg}" alt="${escapeHtmlBooking(title)}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
                        <span style="position: absolute; top: 10px; right: 10px; background: rgba(100, 116, 139, 0.92); backdrop-filter: blur(4px); color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: bold;">
                            🗄️ ${itemTour.countBookings} Storici
                        </span>
                    </div>

                    <div style="padding: 16px;">
                        <h4 style="color: #0b2545; margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 800;">
                            🏛️ ${escapeHtmlBooking(title)}
                        </h4>

                        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                            <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: bold;">
                                👥 ${itemTour.totalPassengers} Passeggeri Passati
                            </span>
                        </div>

                        <button type="button" class="btn-secondary" style="width: 100%; background: #475569; color: white; padding: 9px; font-size: 0.88rem; font-weight: 800; border-radius: 10px;">
                            🗄️ Apri Storico Tour →
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    // Renderizza lo Storico con la LISTA PASSEGGERI COMPLETA di un singolo Itinerario
    renderDettaglioCartellaArchivio(titoloTour, passateDelTour) {
        const mappaDataOrario = {};

        passateDelTour.forEach(b => {
            const dateStr = b.dateReadable || b.dateISO || 'Data Sconosciuta';
            const timeStr = b.time || b.slotTime || '09:30';
            const key = `${dateStr}_${timeStr}`;

            if (!mappaDataOrario[key]) {
                mappaDataOrario[key] = {
                    dateStr: dateStr,
                    timeStr: timeStr,
                    bookings: []
                };
            }
            mappaDataOrario[key].bookings.push(b);
        });

        const gruppiSvolti = Object.values(mappaDataOrario);

        let html = `
            <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 18px; margin-bottom: 22px; box-shadow: 0 4px 14px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button type="button" class="btn-secondary btn-small" onclick="adminArchivio.chiudiCartellaArchivio()" style="background: #f1f5f9; color: #0b2545; border: 1.5px solid #cbd5e1; font-weight: bold;">
                            ← Torna all'Archivio Itinerari
                        </button>
                        <h3 style="color: #0b2545; margin: 0; font-size: 1.25rem; font-weight: 800;">
                            🗄️ Storico: ${escapeHtmlBooking(titoloTour)}
                        </h3>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 20px;">
        `;

        if (gruppiSvolti.length === 0) {
            html += `<p style="color:#64748b; text-align:center; padding:20px;">Nessun tour passato per questo itinerario.</p>`;
        } else {
            gruppiSvolti.forEach(g => {
                const righePasseggeri = [];
                let counter = 1;

                g.bookings.forEach(b => {
                    if (b.participantsList && b.participantsList.length > 0) {
                        b.participantsList.forEach((p, idxP) => {
                            righePasseggeri.push({
                                rowNum: counter++,
                                code: b.code || '#SPT-BOOK',
                                passengerName: p.name || 'N/D',
                                passengerType: p.type || (idxP === 0 ? 'Referente' : 'Adulto'),
                                passengerDob: p.dob || 'N/D',
                                passengerOrigin: p.origin || 'N/D',
                                passengerNotes: p.notes || '',
                                leadPhone: b.customerPhone || 'N/D'
                            });
                        });
                    } else {
                        righePasseggeri.push({
                            rowNum: counter++,
                            code: b.code || '#SPT-BOOK',
                            passengerName: b.customerName || 'N/D',
                            passengerType: 'Referente',
                            passengerDob: 'N/D',
                            passengerOrigin: 'N/D',
                            passengerNotes: b.notes || '',
                            leadPhone: b.customerPhone || 'N/D'
                        });
                    }
                });

                html += `
                    <div style="background: #ffffff; border: 1.5px solid #000000; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; border-bottom: 2px solid #000000; padding-bottom: 8px;">
                            <div>
                                <strong style="color: #0b2545; font-size: 1.1rem;">📅 Data: ${escapeHtmlBooking(g.dateStr)} - ⏰ Ore ${escapeHtmlBooking(g.timeStr)}</strong>
                                <span style="background: #f1f5f9; color: #334155; padding: 3px 10px; border-radius: 12px; font-size: 0.82rem; font-weight: bold; margin-left: 10px; border: 1px solid #cbd5e1;">
                                    👥 Totale ${righePasseggeri.length} Passeggeri Svolti
                                </span>
                            </div>

                            <div style="display: flex; gap: 8px;">
                                <button type="button" class="btn-secondary btn-small" style="background:#0284c7; color:#fff;" onclick="stampaFoglioPresenzeGuidaParticolare('${escapeHtmlBooking(titoloTour)}')">
                                    📄 Salva PDF / Stampa
                                </button>
                                <button type="button" class="btn-danger btn-small" onclick="adminArchivio.eliminaGruppoArchivio('${escapeHtmlBooking(titoloTour)}', '${escapeHtmlBooking(g.dateStr)}', '${escapeHtmlBooking(g.timeStr)}')">
                                    🗑️ Elimina Questa Lista
                                </button>
                            </div>
                        </div>

                        <!-- TABELLA NOMI COMPLETA E DETTAGLIATA -->
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; background: #ffffff;">
                                <thead>
                                    <tr style="background: #ffffff; color: #000000; font-weight: 800; border-bottom: 2px solid #000000;">
                                        <th style="padding: 8px; border: 1px solid #000000; text-align: center; width: 45px;">Check</th>
                                        <th style="padding: 8px; border: 1px solid #000000; text-align: center; width: 30px;">#</th>
                                        <th style="padding: 8px; border: 1px solid #000000;">Passeggero (Nome e Cognome)</th>
                                        <th style="padding: 8px; border: 1px solid #000000;">Ruolo</th>
                                        <th style="padding: 8px; border: 1px solid #000000;">Data Nascita</th>
                                        <th style="padding: 8px; border: 1px solid #000000;">Provenienza</th>
                                        <th style="padding: 8px; border: 1px solid #000000;">Telefono Referente</th>
                                        <th style="padding: 8px; border: 1px solid #000000;">Note Passeggero</th>
                                        <th style="padding: 8px; border: 1px solid #000000;">Codice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${righePasseggeri.map(r => `
                                        <tr style="background: #ffffff; border-bottom: 1px solid #cbd5e1;">
                                            <td style="padding: 8px; border: 1px solid #000000; text-align: center; color: #64748b; font-family: monospace;">[ &nbsp; ]</td>
                                            <td style="padding: 8px; border: 1px solid #000000; text-align: center; font-weight: bold;">${r.rowNum}</td>
                                            <td style="padding: 8px; border: 1px solid #000000; font-weight: 800; color: #0f172a;">${escapeHtmlBooking(r.passengerName)}</td>
                                            <td style="padding: 8px; border: 1px solid #000000; font-size: 0.83rem; color: #475569;">${escapeHtmlBooking(r.passengerType)}</td>
                                            <td style="padding: 8px; border: 1px solid #000000; color: #1e293b;">${escapeHtmlBooking(r.passengerDob)}</td>
                                            <td style="padding: 8px; border: 1px solid #000000; color: #1e293b;">${escapeHtmlBooking(r.passengerOrigin)}</td>
                                            <td style="padding: 8px; border: 1px solid #000000; font-size: 0.83rem;">${escapeHtmlBooking(r.leadPhone)}</td>
                                            <td style="padding: 8px; border: 1px solid #000000; font-size: 0.83rem; color: #64748b;">${r.passengerNotes ? escapeHtmlBooking(r.passengerNotes) : '-'}</td>
                                            <td style="padding: 8px; border: 1px solid #000000; font-family: monospace; font-weight: bold; color: #0369a1;">${escapeHtmlBooking(r.code)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div></div>`;
        return html;
    }

    // Elimina un singolo orario/data dall'archivio
    eliminaGruppoArchivio(tourTitle, dateStr, timeStr) {
        if (!confirm(`Sei sicuro di voler eliminare definitivamente le prenotazioni archiviate per "${tourTitle}" (${dateStr} ore ${timeStr})?`)) return;

        let list = getPrenotazioniAdmin();
        list = list.filter(b => {
            const matchTour = b.tourTitle === tourTitle;
            const matchDate = (b.dateReadable || b.dateISO) === dateStr;
            const matchTime = (b.time || b.slotTime) === timeStr;
            return !(matchTour && matchDate && matchTime && this.isPrenotazionePassata(b));
        });

        savePrenotazioniAdmin(list);
        caricaPrenotazioniAdmin();
    }

    // Svuota completamente l'archivio
    svuotaTuttoArchivio() {
        if (!confirm("Sei sicuro di voler eliminare DEFINITIVAMENTE TUTTE le prenotazioni passate nell'archivio storico?")) return;

        let list = getPrenotazioniAdmin();
        list = list.filter(b => !this.isPrenotazionePassata(b));
        savePrenotazioniAdmin(list);
        caricaPrenotazioniAdmin();
    }
}

// Istanza globale gestore archivio storico
window.adminArchivio = new AdminArchivioManager();
