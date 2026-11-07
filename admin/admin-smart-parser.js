/**
 * MODULO SEPARATO SMART PARSER - Sicily Palermo Tour
 * Analizza e auto-compila i campi del modulo itinerario da post WhatsApp/Social.
 */

class AdminSmartParser {
    constructor() {
        this.monthMap = {
            'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
            'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
            'settembre': '09', 'ottobre': '10', 'novembren': '11', 'dicembre': '12',
            'gen': '01', 'feb': '02', 'mar': '03', 'apr': '04',
            'mag': '05', 'giu': '06', 'lug': '07', 'ago': '08',
            'set': '09', 'ott': '10', 'nov': '11', 'dic': '12'
        };
    }

    toggleParserBox() {
        const container = document.getElementById('parser-input-container');
        if (container) {
            container.classList.toggle('hidden');
        }
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
            alert('✨ Modulo auto-compilato con successo! Verifica i campi e carica la locandina prima di salvare.');
        } catch (err) {
            console.error('Errore durante l\'auto-compilazione:', err);
            alert('⚠️ Si è verificato un errore durante l\'analisi del testo. Controlla i dati manualmente.');
        }
    }

    parseText(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const fullText = text;

        // 1. Estrazione Titolo (Prima riga non vuota con testo significativo)
        let title = lines[0] || 'Nuovo Tour in Bus';
        // Rimuove eventuali emoji decorative o simboli iniziali ma mantiene leggibilità
        title = title.replace(/^[^\w\s\u00C0-\u024F\u1E00-\u1EFF]+/g, '').trim();

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
        if (lowerText.includes('food') || lowerText.includes('degustaz') || lowerText.includes('mangiare') || lowerText.includes('street')) {
            category = 'Street Food';
        } else if (lowerText.includes('mare') || lowerText.includes('spiaggia') || lowerText.includes('barca') || lowerText.includes('natura')) {
            category = 'Mare e Natura';
        } else if (lowerText.includes('storia') || lowerText.includes('monument') || lowerText.includes('chiesa') || lowerText.includes('museo')) {
            category = 'Storia e Cultura';
        } else if (lowerText.includes('bus') || lowerText.includes('transfer') || lowerText.includes('partenze') || lowerText.includes('carnevale')) {
            category = 'Trasporti';
        } else {
            category = 'Esperienze e Tradizioni';
        }

        // 4. Estrazione Data Fissa
        let singleFixedDate = '';
        let availabilityType = 'weekly';

        // Cerca pattern tipo: 7 febbraio, Domenica 7 febbraio, 07/02/2025, 07-02
        const dateMatch = fullText.match(/(\d{1,2})\s+([a-zà-ú]{3,10})(?:\s+(\d{4}))?/i) || fullText.match(/(\d{1,2})[\/\.-](\d{1,2})(?:[\/\.-](\d{2,4}))?/);
        if (dateMatch) {
            const dayNum = parseInt(dateMatch[1], 10);
            let monthStr = dateMatch[2] ? dateMatch[2].toLowerCase() : '';
            let monthNum = this.monthMap[monthStr] || (dateMatch[2] ? dateMatch[2].padStart(2, '0') : '');

            let year = dateMatch[3] || new Date().getFullYear();
            if (year.length === 2) year = '20' + year;

            if (dayNum > 0 && dayNum <= 31 && monthNum) {
                const dayPadded = String(dayNum).padStart(2, '0');
                singleFixedDate = `${year}-${monthNum}-${dayPadded}`;
                availabilityType = 'singleDate';
            }
        }

        // 5. Estrazione Punti di Raccolta e Orari
        const pickupPoints = [];
        lines.forEach(line => {
            if (/partenz|raccolta|fermat|giotto|villabate|bagheria|piazza|piazzale|ore\s*\d+/i.test(line)) {
                // Pulisce il prefisso emoji o spunte
                const cleanLine = line.replace(/^[👉📍✅🚌•\s\*-]+/g, '').trim();
                if (cleanLine && cleanLine.length > 3 && !cleanLine.toLowerCase().startsWith('partenze:')) {
                    pickupPoints.push(cleanLine);
                }
            }
        });

        if (pickupPoints.length === 0) {
            pickupPoints.push('Piazzale Giotto (Ore 10:00)', 'Villabate (Ore 10:20)', 'Bagheria (Ore 10:40)');
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
                if (line.length > 10 && !line.includes('€') && !line.includes('393')) {
                    tappe.push(line);
                }
            }
        });

        if (tappe.length === 0) {
            tappe.push(
                'Incontro nei punti di raccolta e partenza in Bus GT',
                'Arrivo a destinazione e tempo libero per le attività previste dal programma',
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
            pickupPoints,
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

        // Disponibilità e Data Fissa
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
        }

        // Punti di Raccolta Dinamici
        if (typeof puntiRaccoltaCorrenti !== 'undefined') {
            puntiRaccoltaCorrenti.length = 0;
            if (data.pickupPoints && data.pickupPoints.length > 0) {
                data.pickupPoints.forEach(pt => puntiRaccoltaCorrenti.push(pt));
            } else {
                puntiRaccoltaCorrenti.push('Piazzale Giotto (Ore 10:00)');
            }
            if (typeof renderCampiPuntiRaccolta === 'function') {
                renderCampiPuntiRaccolta();
            }
        }

        // Tappe
        if (typeof tappeCorrenti !== 'undefined') {
            tappeCorrenti.length = 0;
            data.tappe.forEach(t => tappeCorrenti.push(t));
            if (typeof renderCampiTappe === 'function') {
                renderCampiTappe();
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
