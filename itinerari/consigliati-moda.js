/**
 * MODULO AUTONOMO SEPARATO: Gestione Sezioni "Consigliati per Te" & "Più alla Moda / Trending"
 * Sicily Palermo Tour - Render Visivo Dinamico & Sincronizzazione con Admin
 */

class ConsigliatiModaManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(() => this.renderSezioni(), 50);
        } else {
            document.addEventListener('DOMContentLoaded', () => this.renderSezioni());
        }
    }

    // Carica gli itinerari dal localStorage / Cloud
    getItinerari() {
        try {
            const saved = localStorage.getItem('spt_itineraries');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error("Errore lettura itinerari in ConsigliatiModaManager:", e);
        }
        return [];
    }

    renderSezioni() {
        const list = this.getItinerari();

        const containerConsigliati = document.getElementById('sezione-consigliati-container');
        const containerModa = document.getElementById('sezione-moda-container');

        if (!containerConsigliati && !containerModa) return;

        if (!list || list.length === 0) {
            if (containerConsigliati) containerConsigliati.style.display = 'none';
            if (containerModa) containerModa.style.display = 'none';
            return;
        }

        // 1. Filtro "Consigliati per Te" (STRETTAMENTE SOLO quelli selezionati dall'Admin)
        const consigliatiList = list.filter(item => item.isConsigliato === true || item.isConsigliato === 'true');

        // 2. Filtro "Più alla Moda / Trending" (STRETTAMENTE SOLO quelli selezionati dall'Admin)
        const modaList = list.filter(item => item.isAllaModa === true || item.isAllaModa === 'true');

        if (containerConsigliati) {
            if (consigliatiList.length > 0) {
                containerConsigliati.style.display = 'block';
                this.renderConsigliatiSection(containerConsigliati, consigliatiList);
            } else {
                containerConsigliati.style.display = 'none';
                containerConsigliati.innerHTML = '';
            }
        }

        if (containerModa) {
            if (modaList.length > 0) {
                containerModa.style.display = 'block';
                this.renderModaSection(containerModa, modaList);
            } else {
                containerModa.style.display = 'none';
                containerModa.innerHTML = '';
            }
        }
    }

    renderConsigliatiSection(container, tours) {
        if (!container || tours.length === 0) return;

        container.innerHTML = `
            <div class="consigliati-moda-header">
                <div class="consigliati-moda-title-box">
                    <h2 class="consigliati-moda-title">
                        ⭐ Consigliati per Te
                    </h2>
                    <p class="consigliati-moda-subtitle">I tour e gli itinerari più amati dai viaggiatori scelti per te dalle nostre guide esperte.</p>
                </div>
                <span class="badge-consigliato">⭐ Selezione Esclusiva</span>
            </div>

            <div class="consigliati-grid">
                ${tours.map(tour => this.renderTourCardHTML(tour, 'consigliato')).join('')}
            </div>
        `;
    }

    renderModaSection(container, tours) {
        if (!container || tours.length === 0) return;

        container.innerHTML = `
            <div class="consigliati-moda-header" style="margin-top: 50px;">
                <div class="consigliati-moda-title-box">
                    <h2 class="consigliati-moda-title">
                        🔥 Più alla Moda & Trending
                    </h2>
                    <p class="consigliati-moda-subtitle">I luoghi più cliccati del momento, le esperienze culinarie ed i tour fotografici imperdibili.</p>
                </div>
                <span class="badge-moda">🔥 Trend del Mese</span>
            </div>

            <div class="consigliati-grid">
                ${tours.map(tour => this.renderTourCardHTML(tour, 'moda')).join('')}
            </div>
        `;
    }

    renderTourCardHTML(item, tipo) {
        const coverImg = (item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || 'https://via.placeholder.com/400x250?text=Palermo+Tour');
        const badgeLabel = tipo === 'consigliato' ? '⭐ Consigliato' : '🔥 Più alla Moda';
        const badgeClass = tipo === 'consigliato' ? 'badge-consigliato' : 'badge-moda';

        return `
            <div class="tour-card-special">
                <div class="tour-card-img-box">
                    <img src="${coverImg}" alt="${this.escapeHtml(item.title)}" loading="lazy">
                    <div class="tour-card-top-tag">
                        <span class="${badgeClass}">${badgeLabel}</span>
                    </div>
                    <div class="tour-card-price-tag">
                        💰 ${this.escapeHtml(item.price || 'Da 25€')}
                    </div>
                </div>

                <div class="tour-card-body">
                    <div class="tour-card-category">🏛️ ${this.escapeHtml(item.category || 'Tour Palermo')}</div>
                    <h3 class="tour-card-title">${this.escapeHtml(item.title)}</h3>
                    <p class="tour-card-desc">${this.escapeHtml(item.shortDesc || item.fullDesc || 'Scopri le meraviglie di Palermo con la nostra guida esperta.')}</p>

                    <div class="tour-card-footer">
                        <span class="tour-card-duration">⏱️ ${this.escapeHtml(item.duration || '3 Ore')}</span>
                        <button type="button" class="btn-card-action" onclick="consigliatiModaManager.apriDettaglioTour('${item.id}')">
                            🎟️ Dettagli & Prenota
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    apriDettaglioTour(tourId) {
        if (typeof window.apriDettagliModal === 'function') {
            window.apriDettagliModal(tourId);
        } else if (typeof window.mostraDettaglio === 'function') {
            window.mostraDettaglio(tourId);
        } else {
            window.location.href = `prenotazioni/prenotazione.html?tourId=${encodeURIComponent(tourId)}`;
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Istanza globale del modulo autonomo
window.consigliatiModaManager = new ConsigliatiModaManager();
