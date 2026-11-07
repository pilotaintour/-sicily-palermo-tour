/**
 * MODULO SEPARATO SMART PARSER - Sicily Palermo Tour
 * Analizza e auto-compila i campi del modulo itinerario da post WhatsApp/Social.
 */

class AdminSmartParser {
    constructor() {
        this.monthMap = {
            'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
            'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
            'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
            'gen': '01', 'feb': '02', 'mar': '03', 'apr': '04',
            'mag': '05', 'giu': '06', 'lug': '07', 'ago': '08',
            'set': '09', 'ott': '10', 'nov': '11', 'dic': '12',
            'january': '01', 'february': '02', 'march': '03', 'april': '04',
            'may': '05', 'june': '06', 'july': '07', 'august': '08',
            'september': '09', 'october': '10', 'november': '11', 'december': '12',
            'jan': '01', 'mar': '03', 'may': '05', 'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'dec': '12'
        };
    }

    toggleParserBox() {
        const container = document.getElementById('parser-input-container');
        if (container) {
            container.classList.toggle('hidden');
        }
    }

    extractDatesFromText(text) {
        const foundDates = [];
        const seenISO = new Set();
        const currentYear = new Date().getFullYear();

        // 1. Day + Month (es: "7 Febbraio 2025", "07 Feb", "7th February")
        const dayMonthRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:di\s+)?([a-zà-ú]{3,10})(?:\s+(\d{4}))?\b/gi;
        let match;
        while ((match = dayMonthRegex.exec(text)) !== null) {
            const dayNum = parseInt(match[1], 10);
            const monthStr = match[2].toLowerCase();
            let year = match[3] || currentYear;
            if (String(year).length === 2) year = '20' + year;

            const monthNum = this.monthMap[monthStr];
            if (dayNum >= 1 && dayNum <= 31 && monthNum) {
                const dayPadded = String(dayNum).padStart(2, '0');
                const iso = `${year}-${monthNum}-${dayPadded}`;
                if (!seenISO.has(iso)) {
                    seenISO.add(iso);
                    foundDates.push({ iso, day: dayNum, month: monthNum, year: String(year), raw: match[0] });
                }
            }
        }

        // 2. Month + Day (es: "February 7", "Feb 7", "February 7 2025")
        const monthDayRegex = /\b([a-zà-ú]{3,10})\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?\b/gi;
        while ((match = monthDayRegex.exec(text)) !== null) {
            const monthStr = match[1].toLowerCase();
            const dayNum = parseInt(match[2], 10);
            let year = match[3] || currentYear;
            if (String(year).length === 2) year = '20' + year;

            const monthNum = this.monthMap[monthStr];
            if (dayNum >= 1 && dayNum <= 31 && monthNum) {
                const dayPadded = String(dayNum).padStart(2, '0');
                const iso = `${year}-${monthNum}-${dayPadded}`;
                if (!seenISO.has(iso)) {
                    seenISO.add(iso);
                    foundDates.push({ iso, day: dayNum, month: monthNum, year: String(year), raw: match[0] });
                }
            }
        }

        // 3. Numeric Date (es: "07/02/2025", "7/2/25", "07-02-2025", "07.02.2025")
        const numDateRegex = /\b(\d{1,2})[\/\.-](\d{1,2})(?:[\/\.-](\d{2,4}))?\b/g;
        while ((match = numDateRegex.exec(text)) !== null) {
            const dayNum = parseInt(match[1], 10);
            const monthNum = String(parseInt(match[2], 10)).padStart(2, '0');
            let year = match[3] || currentYear;
            if (String(year).length === 2) year = '20' + year;

            if (dayNum >= 1 && dayNum <= 31 && parseInt(monthNum, 10) >= 1 && parseInt(monthNum, 10) <= 12) {
                const dayPadded = String(dayNum).padStart(2, '0');
                const iso = `${year}-${monthNum}-${dayPadded}`;
                if (!seenISO.has(iso)) {
                    seenISO.add(iso);
                    foundDates.push({ iso, day: dayNum, month: monthNum, year: String(year), raw: match[0] });
                }
            }
        }

        foundDates.sort((a, b) => a.iso.localeCompare(b.iso));
        return foundDates;
    }

    autoCompilaForm() {
        const textarea = document.getElementById('smart-parser-input');
        if (!textarea) return;

        const rawText = textarea.value.trim();
        if (!rawText) {
            alert('⚠️ Per favore incolla prima il testo del post nel riquadro.');
            return;
        }

        try {
            const parsed = this.parseText(rawText);
            this.applicaCampiForm(parsed);
            const orariStr = parsed.timeSlots.map(s => `${s.time} (53p)`).join(', ');

            let dateMsg = '';
            if (parsed.extractedDates && parsed.extractedDates.length > 1) {
                const dateListStr = parsed.extractedDates.map(d => `${String(d.day).padStart(2, '0')}/${d.month}/${d.year}`).join(', ');
                dateMsg = `📅 Estratte ${parsed.extractedDates.length} DATE FISSE:\n- ${dateListStr}\n(Impostata data principale: ${parsed.extractedDates[0].day}/${parsed.extractedDates[0].month}/${parsed.extractedDates[0].year})`;
            } else if (parsed.extractedDates && parsed.extractedDates.length === 1) {
                const d = parsed.extractedDates[0];
                dateMsg = `📅 Estratta DATA FISSA:\n- ${String(d.day).padStart(2, '0')}/${d.month}/${d.year}`;
            } else {
                dateMsg = `🗓️ Nessuna data specifica trovata nel testo (Disponibilità settimanale)`;
            }

            alert(`✨ Modulo auto-compilato con successo!\n\n${dateMsg}\n\n📍 Estratte ${parsed.pickupPoints.length} fermate:\n- ${parsed.pickupPoints.join('\n- ')}\n\n⏰ Estratti ${parsed.timeSlots.length} orari (53 posti):\n- ${orariStr}\n\nVerifica i campi e carica la locandina prima di salvare.`);
        } catch (err) {
            console.error('Errore durante l\'auto-compilazione:', err);
            alert('⚠️ Si è verificato un errore durante l\'analisi del testo. Controlla i dati manualmente.');
        }
    }

    parseText(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const fullText = text;

        // 1. Estrazione Titolo
        let title = lines[0] || 'Nuovo Tour in Bus';
        title = title.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/^[^\w\s\u00C0-\u024F\u1E00-\u1EFF]+/g, '').trim();
        if (!title) title = 'Carnevale di Misterbianco & IKEA Catania';

        // 2. Estrazione Prezzo
        let price = '30,00€ a persona';
        const priceMatch = fullText.match(/(?:€|euro|\bquota\b[^\d]*)\s*(\d+[\.,]?\d*)|(\d+[\.,]?\d*)\s*€/i);
        if (priceMatch) {
            const num = priceMatch[1] || priceMatch[2];
            if (num) price = `${num.replace('.', ',')}€ a persona`;
        }

        // 3. Estrazione Categoria
        let category = 'Trasporti';
        const lowerText = fullText.toLowerCase();
        if (lowerText.includes('food') || lowerText.includes('degustaz') || lowerText.includes('street')) {
            category = 'Street Food';
        } else if (lowerText.includes('mare') || lowerText.includes('spiaggia') || lowerText.includes('natura')) {
            category = 'Mare e Natura';
        } else if (lowerText.includes('storia') || lowerText.includes('monument') || lowerText.includes('museo')) {
            category = 'Storia e Cultura';
        } else if (lowerText.includes('bus') || lowerText.includes('partenz') || lowerText.includes('carnevale')) {
            category = 'Trasporti';
        } else {
            category = 'Esperienze e Tradizioni';
        }

        // 4. Estrazione Data o Date Fisse Evento
        const extractedDates = this.extractDatesFromText(fullText);
        let singleFixedDate = '';
        let availabilityType = 'weekly';
        const activeWeekDays = [];

        if (extractedDates.length > 0) {
            availabilityType = 'singleDate';
            singleFixedDate = extractedDates[0].iso;

            extractedDates.forEach(d => {
                const parts = d.iso.split('-');
                const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                const dayOfWeek = dt.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
                if (!activeWeekDays.includes(dayOfWeek)) {
                    activeWeekDays.push(dayOfWeek);
                }
            });
        }

        // 5. Estrazione Punti di Raccolta e Orari
        const pickupPoints = [];
        lines.forEach(line => {
            if (/partenz|raccolta|fermat|stop|giotto|villabate|bagheria|piazza|piazzale|ore\s*\d+|at\s*\d+/i.test(line)) {
                let cleanLine = line.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}👉📍✅🚌•\*\-]/gu, '').trim();
                cleanLine = cleanLine.replace(/^[:\s\*-]+/g, '').trim();
                if (cleanLine && cleanLine.length > 3 && !cleanLine.toLowerCase().startsWith('partenze') && !cleanLine.toLowerCase().startsWith('stops')) {
                    pickupPoints.push(cleanLine);
                }
            }
        });

        if (pickupPoints.length === 0) {
            pickupPoints.push('Piazzale Giotto (Ore 10:00)', 'Villabate (Ore 10:20)', 'Bagheria (Ore 10:40)');
        }

        // 5b. Estrazione Orari Dinamici nel testo (con capienza predefinita di 53 posti)
        const extractedTimeSlots = [];
        const seenTimes = new Set();

        const hhmmRegex = /\b([0-1]?[0-9]|2[0-3])[:\.](([0-5][0-9]))\b(?!\s*(?:€|euro|eur|\$|%|[\.-]\d{2,4}))/gi;
        let timeMatch;
        while ((timeMatch = hhmmRegex.exec(fullText)) !== null) {
            const hh = String(timeMatch[1]).padStart(2, '0');
            const mm = timeMatch[2];
            const timeStr = `${hh}:${mm}`;
            if (!seenTimes.has(timeStr)) {
                seenTimes.add(timeStr);
                extractedTimeSlots.push({ time: timeStr, capacity: 53 });
            }
        }

        const oreRegex = /\bore\s*([0-1]?[0-9]|2[0-3])(?!\s*[:\.]\s*\d)\b/gi;
        while ((timeMatch = oreRegex.exec(fullText)) !== null) {
            const hh = String(timeMatch[1]).padStart(2, '0');
            const timeStr = `${hh}:00`;
            if (!seenTimes.has(timeStr)) {
                seenTimes.add(timeStr);
                extractedTimeSlots.push({ time: timeStr, capacity: 53 });
            }
        }

        extractedTimeSlots.sort((a, b) => a.time.localeCompare(b.time));

        if (extractedTimeSlots.length === 0) {
            extractedTimeSlots.push({ time: '10:00', capacity: 53 });
        }

        // 6. Estrazione Programma e Tappe
        const tappe = [];
        let inProgramma = false;
        lines.forEach(line => {
            if (line.toUpperCase().includes('PROGRAMMA:')) {
                inProgramma = true;
                return;
            }
            if (inProgramma) {
                let cleanTappa = line.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
                if (cleanTappa.length > 10 && !cleanTappa.includes('€') && !cleanTappa.includes('393')) {
                    tappe.push(cleanTappa);
                }
            }
        });

        if (tappe.length === 0) {
            tappe.push(
                'Incontro nei punti di raccolta e partenza in Bus GT',
                'Sosta all’IKEA di Catania e tempo libero per lo shopping',
                'Pomeriggio al famoso Carnevale di Misterbianco tra sfilate e maschere',
                'Ritrovo dei partecipanti e partenza per il viaggio di rientro'
            );
        }

        // 7. Descrizione Breve e Completa
        const shortDesc = lines.slice(0, 3).join(' ').substring(0, 160) + '...';
        const fullDesc = fullText;

        return {
            title,
            price,
            category,
            availabilityType,
            singleFixedDate,
            extractedDates,
            activeWeekDays,
            pickupPoints,
            timeSlots: extractedTimeSlots,
            tappe,
            shortDesc,
            fullDesc
        };
    }

    applicaCampiForm(data) {
        // Titolo
        const titleEl = document.getElementById('title');
        if (titleEl) titleEl.value = data.title;

        // Categoria
        const categoryEl = document.getElementById('category');
        if (categoryEl) categoryEl.value = data.category;

        // Durata
        const durationEl = document.getElementById('duration');
        if (durationEl) durationEl.value = '1 Giorno';

        // Prezzo
        const priceEl = document.getElementById('price');
        if (priceEl) priceEl.value = data.price;

        // In Evidenza
        const featuredEl = document.getElementById('featured');
        if (featuredEl) featuredEl.value = 'true';

        // Posizionamento Speciale (Consigliato & Trending)
        const isConsigliatoEl = document.getElementById('is-consigliato');
        if (isConsigliatoEl) isConsigliatoEl.checked = true;

        const isAllaModaEl = document.getElementById('is-alla-moda');
        if (isAllaModaEl) isAllaModaEl.checked = true;

        // Disponibilità e Data Fissa Evento
        if (data.availabilityType === 'singleDate' && data.singleFixedDate) {
            const radioSingle = document.querySelector('input[name="availability-type"][value="singleDate"]');
            if (radioSingle) {
                radioSingle.checked = true;
                if (typeof gestisciTipoDisponibilitaTour === 'function') {
                    gestisciTipoDisponibilitaTour('singleDate');
                }
            }
            const dateInput = document.getElementById('single-fixed-date-input');
            if (dateInput) dateInput.value = data.singleFixedDate;
        } else {
            const radioWeekly = document.querySelector('input[name="availability-type"][value="weekly"]');
            if (radioWeekly) {
                radioWeekly.checked = true;
                if (typeof gestisciTipoDisponibilitaTour === 'function') {
                    gestisciTipoDisponibilitaTour('weekly');
                }
            }
        }

        // Seleziona i giorni della settimana attivi per le date estratte
        if (data.activeWeekDays && data.activeWeekDays.length > 0) {
            document.querySelectorAll('input[name="giorno-check"]').forEach(c => {
                c.checked = data.activeWeekDays.includes(parseInt(c.value, 10));
            });
            const checkAll = document.getElementById('check-all-days');
            if (checkAll) {
                checkAll.checked = (data.activeWeekDays.length === 7);
            }
        }

        // Punti di Raccolta Dinamici (FORZATI SULL'ARRAY GLOBALE ED AGGIORNAMENTO RENDERING)
        if (typeof puntiRaccoltaCorrenti !== 'undefined') {
            puntiRaccoltaCorrenti.length = 0;
            if (data.pickupPoints && data.pickupPoints.length > 0) {
                data.pickupPoints.forEach(pt => puntiRaccoltaCorrenti.push(pt));
            } else {
                puntiRaccoltaCorrenti.push('Piazzale Giotto (Ore 10:00)', 'Villabate (Ore 10:20)', 'Bagheria (Ore 10:40)');
            }
            if (typeof renderCampiPuntiRaccolta === 'function') {
                renderCampiPuntiRaccolta();
            }
        }

        // Tappe
        if (typeof tappeCorrenti !== 'undefined') {
            tappeCorrenti.length = 0;
            if (data.tappe && data.tappe.length > 0) {
                data.tappe.forEach(t => tappeCorrenti.push(t));
            }
            if (typeof renderCampiTappe === 'function') {
                renderCampiTappe();
            }
        }

        // Capienza Bus Condivisa (Attiva per default per Bus da 53 posti)
        const busCheckMain = document.getElementById('shared-bus-capacity-main-check');
        const busCheckModal = document.getElementById('shared-bus-capacity-check');
        if (busCheckMain) busCheckMain.checked = true;
        if (busCheckModal) busCheckModal.checked = true;
        if (typeof sincronizzaCheckBus === 'function') {
            sincronizzaCheckBus(true);
        }

        // Capienza fissa 53 posti per TUTTI gli orari estratti dal testo
        if (typeof orariCorrenti !== 'undefined') {
            orariCorrenti.length = 0;
            if (data.timeSlots && data.timeSlots.length > 0) {
                data.timeSlots.forEach(slot => orariCorrenti.push({ time: slot.time, capacity: slot.capacity || 53 }));
            } else {
                orariCorrenti.push({ time: '10:00', capacity: 53 });
            }
            if (typeof renderCampiOrari === 'function') {
                renderCampiOrari();
            }
        }

        // Descrizioni
        const shortDescEl = document.getElementById('short-desc');
        if (shortDescEl) shortDescEl.value = data.shortDesc;

        const fullDescEl = document.getElementById('full-desc');
        if (fullDescEl) fullDescEl.value = data.fullDesc;
    }
}

// Istanza globale del controller Smart Parser
window.adminSmartParser = new AdminSmartParser();
