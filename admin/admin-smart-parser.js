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

    formatPickupPoint(rawPoint) {
        if (!rawPoint) return '';
        // 1. Rimuovi emoticon e punteggiatura iniziale
        let str = String(rawPoint).replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}👉📍✅🚌•\*\-]/gu, ' ').trim();
        str = str.replace(/^[:\s\*\-\d+\.\:\)]+/, '').trim();

        // 2. Rimuovi qualsiasi orario o dicitura "(Ore ...)" per lasciare SOLO il luogo pulito
        str = str.replace(/\(\s*ore\s*[^)]*\)/gi, ' ');
        str = str.replace(/\b(?:ore\s*)?[0-1]?[0-9][\.\:][0-5][0-9]\b/gi, ' ');
        str = str.replace(/\b(?:ore\s*)?[0-1]?[0-9]\b(?=\s*(?:am|pm|h))/gi, ' ');
        str = str.replace(/\s+/g, ' ').trim();

        // 3. Espandi nomi noti per la Sicilia / Palermo
        if (/giotto/i.test(str)) {
            str = 'Piazzale Giotto';
        } else if (/politeama/i.test(str)) {
            str = 'Piazza Politeama';
        } else if (/villabate/i.test(str)) {
            str = 'Villabate';
        } else if (/bagheria/i.test(str)) {
            str = 'Bagheria';
        }

        str = str.replace(/^[:\s\*\-\)]+/, '').replace(/[:\s\*\-\(]+$/, '').trim();

        return str;
    }

    extractTappeFromText(text) {
        const tappe = [];
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        let inProgramma = false;
        let programmaText = '';

        lines.forEach(line => {
            const upper = line.toUpperCase();
            if (upper.includes('PROGRAMMA') || upper.includes('ITINERARIO') || upper.includes('TAPPE')) {
                inProgramma = true;
                return;
            }
            if (inProgramma) {
                if (/COMPRENDE|QUOTA|NOTE|INFORMAZIONI|PRENOTAZIONI|SERVIZI|CONTATTI/i.test(line)) {
                    inProgramma = false;
                    return;
                }
                programmaText += ' ' + line;
            }
        });

        if (programmaText.trim()) {
            const splitPattern = /(?:\.|\n|(?=\b(?:raduno|partenza|arrivo|visita|pranzo|pomeriggio|ingresso|sosta|al termine|rientro)\b))/gi;
            const rawSentences = programmaText.split(splitPattern);

            rawSentences.forEach(s => {
                let clean = s.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}👉📍✅🚌•\*\-\d+\.]/gu, ' ').trim();
                clean = clean.replace(/^[:\s\*\-\d+\.\:\)]+/, '').trim();
                if (clean.length >= 12 && clean.length <= 150 && !/€|euro|334|091|quota|include|comprende/i.test(clean)) {
                    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
                    if (!tappe.includes(clean)) {
                        tappe.push(clean);
                    }
                }
            });
        }

        if (tappe.length === 0) {
            lines.forEach(line => {
                if (/^[\d+\.\-\*•👉📍]\s*/.test(line)) {
                    let clean = line.replace(/^[\d+\.\-\*•👉📍\s]+/, '').trim();
                    clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
                    if (clean.length >= 12 && clean.length <= 120 && !/quota|comprend|prezzo|euro|€|info|tel/i.test(clean)) {
                        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
                        if (!tappe.includes(clean)) {
                            tappe.push(clean);
                        }
                    }
                }
            });
        }

        if (tappe.length === 0) {
            tappe.push(
                'Raduno dei partecipanti nei punti di raccolta e partenza in Bus GT',
                'Visita guidata ai principali monumenti e punti d’interesse',
                'Pranzo e tempo libero a disposizione dei partecipanti',
                'Pomeriggio dedicato alle attività ed attrazioni del programma',
                'Ritrovo dei partecipanti e partenza per il viaggio di rientro'
            );
        }

        return tappe.slice(0, 6);
    }

    extractDatesFromText(text) {
        const foundDates = [];
        const seenISO = new Set();
        const currentYear = new Date().getFullYear();
        const todayISO = new Date().toISOString().split('T')[0];

        const computeScore = (matchIndex, rawMatch) => {
            let score = 0;
            // 1. Posizione nell'intestazione/titolo del post
            if (matchIndex < 250) score += 120;
            else if (matchIndex < 500) score += 60;

            // 2. Contesto precedente (emoticon, giorno della settimana, parole chiave evento)
            const contextBefore = text.substring(Math.max(0, matchIndex - 80), matchIndex).toLowerCase();
            if (/[\u{1F4C5}\u{1F4C6}\u{1F4C7}📅🗓️📆]/u.test(contextBefore)) score += 150;
            if (/domenica|sabato|venerdì|venerdi|giovedì|giovedi|mercoledì|mercoledi|martedì|martedi|lunedì|lunedi|data|giorno|partenza|evento/i.test(contextBefore)) score += 90;

            // 3. Penalizzazione contesti storici/passati ("lo scorso", "nel 1990", "inaugurato nel")
            if (/lo scorso|scorsa|nel\s+\d{4}|inaugurat|costruit|edificat|storia|secolo|fondat/i.test(contextBefore)) score -= 250;

            return score;
        };

        // 1. Date Multiple prima del Mese (es: "14, 15 e 16 Settembre 2026" o "14 e 15 Settembre")
        const multiDayRegex = /\b(\d{1,2}(?:\s*(?:,|\+|e|ed|al|a|-)\s*\d{1,2})+)\s+(?:di\s+)?([a-zà-ú]{3,10})(?:\s+(\d{4}))?\b/gi;
        let match;
        while ((match = multiDayRegex.exec(text)) !== null) {
            const daysPart = match[1];
            const monthStr = match[2].toLowerCase();
            let year = match[3] || currentYear;
            if (String(year).length === 2) year = '20' + year;

            const monthNum = this.monthMap[monthStr];
            if (monthNum) {
                const daysFound = daysPart.match(/\d{1,2}/g);
                if (daysFound) {
                    daysFound.forEach(dStr => {
                        const dayNum = parseInt(dStr, 10);
                        if (dayNum >= 1 && dayNum <= 31) {
                            const dayPadded = String(dayNum).padStart(2, '0');
                            const iso = `${year}-${monthNum}-${dayPadded}`;
                            if (!seenISO.has(iso)) {
                                seenISO.add(iso);
                                let score = computeScore(match.index, match[0]);
                                if (iso >= todayISO) score += 50;
                                foundDates.push({ iso, day: dayNum, month: monthNum, year: String(year), raw: match[0], score, index: match.index });
                            }
                        }
                    });
                }
            }
        }

        // 2. Day + Month (es: "3 Gennaio 2027", "7 Febbraio 2025", "07 Feb")
        const dayMonthRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:di\s+)?([a-zà-ú]{3,10})(?:\s+(\d{4}))?\b/gi;
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
                    let score = computeScore(match.index, match[0]);
                    if (iso >= todayISO) score += 50;
                    foundDates.push({ iso, day: dayNum, month: monthNum, year: String(year), raw: match[0], score, index: match.index });
                }
            }
        }

        // 3. Month + Day (es: "February 7", "Feb 7", "February 7 2025")
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
                    let score = computeScore(match.index, match[0]);
                    if (iso >= todayISO) score += 50;
                    foundDates.push({ iso, day: dayNum, month: monthNum, year: String(year), raw: match[0], score, index: match.index });
                }
            }
        }

        // 4. Numeric Date con riconoscimento intelligente DD/MM (es: "14/09/2026", "09/14/2026", "07/02/2025")
        const numDateRegex = /\b(\d{1,2})[\/\.-](\d{1,2})(?:[\/\.-](\d{2,4}))?\b/g;
        while ((match = numDateRegex.exec(text)) !== null) {
            const p1 = parseInt(match[1], 10);
            const p2 = parseInt(match[2], 10);
            let year = match[3] || currentYear;
            if (String(year).length === 2) year = '20' + year;

            let dayNum = p1;
            let monthVal = p2;

            if (p1 <= 12 && p2 > 12 && p2 <= 31) {
                dayNum = p2;
                monthVal = p1;
            } else if (p1 <= 31 && p2 <= 12) {
                dayNum = p1;
                monthVal = p2;
            } else {
                continue;
            }

            const monthNum = String(monthVal).padStart(2, '0');
            const dayPadded = String(dayNum).padStart(2, '0');
            const iso = `${year}-${monthNum}-${dayPadded}`;
            if (!seenISO.has(iso)) {
                seenISO.add(iso);
                let score = computeScore(match.index, match[0]);
                if (iso >= todayISO) score += 50;
                foundDates.push({ iso, day: dayNum, month: monthNum, year: String(year), raw: match[0], score, index: match.index });
            }
        }

        // Ordina per Punteggio di Rilevanza Decrescente (Data Evento Principale in Cima!)
        foundDates.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.index - b.index;
        });

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

        // 3. Estrazione Categoria, Regioni e Continenti
        let category = 'Tour Giornalieri (Sicilia)';
        const lowerText = fullText.toLowerCase();

        if (/ester|volo|aeroporto|spagna|francia|grecia|londra|parigi|croazia|albania|egitto|malta|islanda|svizzera|germania|europa|internaz|usa|stati uniti|america|giappone|asia|africa|dubai/i.test(lowerText)) {
            // Rileva continente specifico per Tour Esteri
            if (/usa|stati uniti|new york|miami|los angeles|california|canada|mexico|messico|nord america/i.test(lowerText)) {
                category = 'Tour Esteri (USA e Nord America)';
            } else if (/brasile|argentina|perù|peru|cile|colombia|america del sud|sud america|latina/i.test(lowerText)) {
                category = 'Tour Esteri (America del Sud)';
            } else if (/giappone|tokyo|cina|beijing|thailandia|bangkok|vietnam|india|indonesia|bali|maldive|asia/i.test(lowerText)) {
                category = 'Tour Esteri (Asia)';
            } else if (/marocco|marrakech|egitto|sharm|cairo|kenya|tanzania|zanzibar|sud africa|madagascar|tunisia|africa/i.test(lowerText)) {
                category = 'Tour Esteri (Africa)';
            } else if (/dubai|emirati|giordania|petra|qatar|oman|turchia|istanbul|cappadocia|medio oriente/i.test(lowerText)) {
                category = 'Tour Esteri (Medio Oriente)';
            } else if (/australia|sydney|nuova zelanda|oceania/i.test(lowerText)) {
                category = 'Tour Esteri (Oceania e Australia)';
            } else {
                category = 'Tour Esteri (Europa)';
            }
        } else if (/più giorni|piu giorni|notti|notte|[2-9]\s*giorni|weekend|soggiorno|tour di più/i.test(lowerText)) {
            category = 'Tour di Più Giorni';
        } else if (/transfer|navetta|taxi|noleggio|shuttle|aeroporto transfer|bus transfer/i.test(lowerText)) {
            category = 'Trasporti';
        } else {
            // Rileva regione specifica per i Tour Giornalieri
            if (/campania|napoli|costiera|amalfi|pompei|caserta|salerno|sorrento/i.test(lowerText)) {
                category = 'Tour Giornalieri (Campania)';
            } else if (/lazio|roma|viterbo|latina|tivoli/i.test(lowerText)) {
                category = 'Tour Giornalieri (Lazio)';
            } else if (/toscana|firenze|pisa|siena|chianti/i.test(lowerText)) {
                category = 'Tour Giornalieri (Toscana)';
            } else if (/lombardia|milano|como|bergamo|brescia/i.test(lowerText)) {
                category = 'Tour Giornalieri (Lombardia)';
            } else if (/puglia|bari|lecce|gallipoli|polignano|alberobello/i.test(lowerText)) {
                category = 'Tour Giornalieri (Puglia)';
            } else if (/calabria|tropea|reggio|cosenza/i.test(lowerText)) {
                category = 'Tour Giornalieri (Calabria)';
            } else if (/sardegna|cagliari|olbia|alghero/i.test(lowerText)) {
                category = 'Tour Giornalieri (Sardegna)';
            } else {
                category = 'Tour Giornalieri (Sicilia)';
            }
        }

        // 4. Estrazione Data o Date Fisse Evento
        const extractedDates = this.extractDatesFromText(fullText);
        let singleFixedDate = '';
        let availabilityType = 'weekly';
        const activeWeekDays = [];

        if (extractedDates.length > 0) {
            availabilityType = 'singleDate';
            singleFixedDate = extractedDates[0].iso;

            // Per la data fissa evento unico, seleziona SOLO il singolo giorno della settimana della data scelta
            const parts = singleFixedDate.split('-');
            const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            const dayOfWeek = dt.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
            activeWeekDays.push(dayOfWeek);
        }

        // 5. Estrazione Punti di Raccolta e Orari (SOLO Luoghi Effettivi, ESCLUSI Termini/Rimborsi/Note/Date/Indirizzi Agenzia)
        const pickupPoints = [];

        // Parole/Frasi da escludere (termini, rimborsi, indirizzi agenzia, contatti)
        const excludeRegex = /garantit|raggiungiment|mancat|sostituzion|rimbors|penal|annullam|cancellaz|richiesta|programma|quota|prezzo|comprende|esclude|incluso|inclusi|raduno|regolament|nota\b|note\b|info\b|informazion|condizion|termini|sconto|commissione|organizzat|assicuraz|bersagliere|pm eventi|agenzia|prenotazioni|telefono|tel\.|cell\./i;

        // Mesi e Giorni per evitare che le righe di data dell'evento vengano scambiate per punti di partenza
        const dateKeywordsRegex = /gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|domenica|sabato|venerdì|venerdi|giovedì|giovedi|mercoledì|mercoledi|martedì|martedi|lunedì|lunedi/i;

        const locationKeywordsRegex = /giotto|villabate|bagheria|politeama|cattedrale|teatro|massimo|stazione|porto|molo|aeroporto|sferracavallo|mondello|monreale|agrigento|catania|trapani|messina|siracusa|enna|caltanissetta|ragusa|piazza|piazzale|via\b|viale\b|corso\b|largo\b|svincolo|casello|distributore|hotel|bar\b|pasticceria|rotonda|pensilina|fermata/i;

        lines.forEach(line => {
            let cleanLine = line.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}👉📍✅🚌•\*\-\d+\.]/gu, ' ').trim();
            cleanLine = cleanLine.replace(/^[:\s\*-]+/g, '').replace(/[:\s]+$/g, '').trim();

            const lower = line.toLowerCase();

            // 1. Salta se contiene regole, termini, indirizzi agenzia o date dell'evento
            if (excludeRegex.test(lower) || dateKeywordsRegex.test(lower)) {
                return;
            }

            // 2. Salta intestazioni di sezione (es. "Punti di raccolta:", "Luoghi di partenza:", "Orari:")
            if (cleanLine.length < 3 || /^(punti|luoghi|orari|partenze|fermate|ritrovo|stoppings)(\s+di\s+raccolta|\s+di\s+partenza)?$/i.test(cleanLine)) {
                return;
            }

            const containsPlaceKeyword = locationKeywordsRegex.test(lower);
            const containsTimePattern = /\b([0-1]?[0-9]|2[0-3])[:\.\s]?[0-5][0-9]\b/.test(lower) || /\bore\b/i.test(lower);

            if (containsPlaceKeyword || (containsTimePattern && (lower.includes('ore') || lower.includes('h')) && cleanLine.length < 60)) {
                const formattedPoint = this.formatPickupPoint(line);

                if (formattedPoint && formattedPoint.length > 3 && !excludeRegex.test(formattedPoint) && !dateKeywordsRegex.test(formattedPoint)) {
                    if (!pickupPoints.some(p => p.toLowerCase() === formattedPoint.toLowerCase())) {
                        pickupPoints.push(formattedPoint);
                    }
                }
            }
        });

        if (pickupPoints.length === 0) {
            pickupPoints.push('Piazzale Giotto', 'Villabate', 'Bagheria');
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

        const hRegex = /\b([0-1]?[0-9]|2[0-3])h(([0-5][0-9]))?\b/gi;
        while ((timeMatch = hRegex.exec(fullText)) !== null) {
            const hh = String(timeMatch[1]).padStart(2, '0');
            const mm = timeMatch[2] || '00';
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

        // Estrazione orari anche dai punti di raccolta estratti (es. "Piazzale Giotto (Ore 09:00)")
        if (pickupPoints && pickupPoints.length > 0) {
            pickupPoints.forEach(pt => {
                const matchPt = pt.match(/(?:Ore|ore|at)?\s*([0-1]?[0-9]|2[0-3])[:\.](([0-5][0-9]))/i);
                if (matchPt) {
                    const hh = String(matchPt[1]).padStart(2, '0');
                    const mm = matchPt[2];
                    const timeStr = `${hh}:${mm}`;
                    if (!seenTimes.has(timeStr)) {
                        seenTimes.add(timeStr);
                        extractedTimeSlots.push({ time: timeStr, capacity: 53 });
                    }
                }
            });
        }

        extractedTimeSlots.sort((a, b) => a.time.localeCompare(b.time));

        if (extractedTimeSlots.length === 0) {
            extractedTimeSlots.push({ time: '09:00', capacity: 53 });
        }

        // 6. Estrazione Intelligente Servizi Inclusi & Caratteristiche dal testo
        const servizi = [];
        const lowerText = fullText.toLowerCase();

        if (/\b(guida|guide|accompagnament)\b/.test(lowerText)) {
            servizi.push('Guida Turistica Autorizzata');
        }
        if (/\b(accompagnator|tour leader)\b/.test(lowerText)) {
            servizi.push('Accompagnatore Turistico / Leader');
        }
        if (/\b(degustazion|street food|assaggi|pranzo|cena|cibo|degustare|aperitiv|prodotti tipici)\b/.test(lowerText)) {
            servizi.push('Degustazioni & Street Food');
        }
        if (/\b(ingress|bigliett|museo|monument|scavi|parco archeologico)\b/.test(lowerText)) {
            servizi.push('Ingressi Monumenti e Musei');
        }
        if (/\b(auricolar|whisper|radioguid)\b/.test(lowerText)) {
            servizi.push('Auricolari Radio Whisper');
        }
        if (/\b(bus|pullman|trasporto|transfer|navetta|autobus)\b/.test(lowerText)) {
            servizi.push('Trasporto / Transfer Incluso');
        }
        if (/\b(assicurazion|polizza)\b/.test(lowerText)) {
            servizi.push('Assicurazione Tour Inclusa');
        }
        if (/\b(whatsapp|assistenza)\b/.test(lowerText)) {
            servizi.push('Assistenza Dedicata WhatsApp');
        }
        if (/\b(cancellazion|rimborso|gratuit)\b/.test(lowerText)) {
            servizi.push('Cancellazione Gratuita');
        }
        if (/\b(famigli|bambin|ragazz)\b/.test(lowerText)) {
            servizi.push('Adatto a Famiglie & Bambini');
        }
        if (/\b(disabil|sedia a rotelle|carrozzin|accessibil)\b/.test(lowerText)) {
            servizi.push('Accessibile Sedia a Rotelle');
        }
        if (/\b(animal|cane|cani|pet)\b/.test(lowerText)) {
            servizi.push('Pet Friendly (Animali Ammessi)');
        }
        if (/\b(camminat|facile|passeggiat)\b/.test(lowerText)) {
            servizi.push('Camminata Facile Pianeggiante');
        }
        if (/\b(ingles|multilingua|english|lingua)\b/.test(lowerText)) {
            servizi.push('Tour Multilingua (ITA/ENG)');
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
            servizi,
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
            if (dateInput) {
                dateInput.value = data.singleFixedDate;
                if (typeof aggiornaEtichettaDataFissaLeggibile === 'function') {
                    aggiornaEtichettaDataFissaLeggibile(data.singleFixedDate);
                }
            }
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
        if (!window.puntiRaccoltaCorrenti || !Array.isArray(window.puntiRaccoltaCorrenti)) {
            window.puntiRaccoltaCorrenti = [];
        }
        window.puntiRaccoltaCorrenti.length = 0;
        if (data.pickupPoints && data.pickupPoints.length > 0) {
            data.pickupPoints.forEach(pt => window.puntiRaccoltaCorrenti.push(pt));
        } else {
            window.puntiRaccoltaCorrenti.push('Piazzale Giotto', 'Villabate');
        }
        if (typeof renderCampiPuntiRaccolta === 'function') {
            renderCampiPuntiRaccolta();
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
        if (!window.orariCorrenti || !Array.isArray(window.orariCorrenti)) {
            window.orariCorrenti = [];
        }
        window.orariCorrenti.length = 0;
        if (data.timeSlots && data.timeSlots.length > 0) {
            data.timeSlots.forEach(slot => window.orariCorrenti.push({ time: slot.time, capacity: slot.capacity || 53 }));
        } else {
            window.orariCorrenti.push({ time: '09:00', capacity: 53 });
        }
        if (typeof renderCampiOrari === 'function') {
            renderCampiOrari();
        }

        // Servizi Inclusi & Caratteristiche Checkboxes
        const serviziChecks = document.querySelectorAll('input[name="servizio-check"]');
        serviziChecks.forEach(c => {
            c.checked = (data.servizi && Array.isArray(data.servizi)) ? data.servizi.includes(c.value) : false;
        });

        // Descrizioni
        const shortDescEl = document.getElementById('short-desc');
        if (shortDescEl) shortDescEl.value = data.shortDesc;

        const fullDescEl = document.getElementById('full-desc');
        if (fullDescEl) fullDescEl.value = data.fullDesc;
    }
}

// Istanza globale del controller Smart Parser
window.adminSmartParser = new AdminSmartParser();
