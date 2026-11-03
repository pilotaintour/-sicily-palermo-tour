/**
 * MODULO AUTONOMO MAPPE & NAVIGAZIONE (Google Maps & OpenStreetMap / Leaflet)
 * Sicily Palermo Tour - Utility riutilizzabile per Mappe Interattive, Link GPS e Mappe Incorporate
 */

// Coordinate Predefinite dei Punti Principali di Palermo (Geocoding Rapido)
const PALERMO_MAP_PRESETS = {
    'Piazzale Giotto': { lat: 38.1345, lng: 13.3421, address: 'Piazzale Giotto, Palermo' },
    'Piazza Politeama': { lat: 38.1247, lng: 13.3562, address: 'Piazza Castelnuovo (Politeama), Palermo' },
    'Cattedrale': { lat: 38.1136, lng: 13.3561, address: 'Cattedrale di Palermo, Corso Vittorio Emanuele' },
    'Teatro Massimo': { lat: 38.1202, lng: 13.3572, address: 'Piazza Giuseppe Verdi (Teatro Massimo), Palermo' },
    'Quattro Canti': { lat: 38.1157, lng: 13.3615, address: 'Quattro Canti (Piazza Vigliena), Palermo' },
    'Stazione Centrale': { lat: 38.1098, lng: 13.3671, address: 'Piazza Giulio Cesare (Stazione Centrale), Palermo' },
    'Porto di Palermo': { lat: 38.1275, lng: 13.3689, address: 'Molo Sammuzzo / Banchina Sammuzzo, Porto di Palermo' },
    'Mercato Ballarò': { lat: 38.1118, lng: 13.3601, address: 'Mercato di Ballarò, Palermo' },
    'Mercato Vucciria': { lat: 38.1172, lng: 13.3636, address: 'Piazza Caracciolo (Vucciria), Palermo' },
    'Mondello': { lat: 38.2031, lng: 13.3331, address: 'Viale Regina Elena, Mondello, Palermo' },
    'Monreale': { lat: 38.0818, lng: 13.2922, address: 'Duomo di Monreale, Monreale' }
};

class MapsService {
    constructor() {
        this.presetCoords = PALERMO_MAP_PRESETS;
    }

    /**
     * Genera un URL diretto di Google Maps per Navigazione GPS o Ricerca Indirizzo
     * @param {string} luogoOrIndirizzo Nome del luogo, indirizzo o coordinate (lat,lng)
     * @returns {string} URL completo per aprire Google Maps su app o browser
     */
    getGoogleMapsUrl(luogoOrIndirizzo) {
        if (!luogoOrIndirizzo) luogoOrIndirizzo = 'Palermo Centro';
        const query = encodeURIComponent(luogoOrIndirizzo.trim() + (luogoOrIndirizzo.toLowerCase().includes('palermo') ? '' : ', Palermo, Italia'));
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    /**
     * Genera un URL di Google Maps per indicazioni di guida / navigazione verso una destinazione
     * @param {string} destinazione Indirizzo o punto di arrivo
     * @param {string} [origine] Punto di partenza facoltativo
     * @returns {string} URL per le indicazioni stradali
     */
    getGoogleDirectionsUrl(destinazione, origine = '') {
        const dest = encodeURIComponent(destinazione.trim() + (destinazione.toLowerCase().includes('palermo') ? '' : ', Palermo'));
        let url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
        if (origine) {
            url += `&origin=${encodeURIComponent(origine.trim())}`;
        }
        return url;
    }

    /**
     * Apre direttamente Google Maps nel browser o nell'applicazione dello smartphone
     * @param {string} luogo Indirizzo o nome punto d'incontro
     */
    apriMappaGoogle(luogo) {
        const url = this.getGoogleMapsUrl(luogo);
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    /**
     * Genera l'HTML di un iFrame Google Maps incorporato gratuito per una pagina web o modale
     * @param {string} luogo Indirizzo o nome luogo da mostrare sulla mappa
     * @param {object} [options] Opzioni come altezza, larghezza e zoom
     * @returns {string} Stringa HTML contenente l'iframe
     */
    getGoogleEmbedIframeHtml(luogo, options = {}) {
        const query = encodeURIComponent((luogo || 'Palermo Centro') + ', Italia');
        const height = options.height || '260px';
        const width = options.width || '100%';
        const borderRadius = options.borderRadius || '12px';

        return `
            <iframe
                width="${width}"
                height="${height}"
                style="border:0; border-radius:${borderRadius}; width:100%; box-shadow:0 4px 12px rgba(0,0,0,0.08);"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed">
            </iframe>
        `;
    }

    /**
     * Carica dinamicamente le risorse OpenStreetMap / Leaflet.js (100% Gratuite e Open Source)
     * @returns {Promise<boolean>} Risolve true appena Leaflet è pronto
     */
    caricaLeafletLibrary() {
        return new Promise((resolve) => {
            if (window.L) {
                resolve(true);
                return;
            }

            // Carica CSS Leaflet
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // Carica JS Leaflet
            if (!document.getElementById('leaflet-js')) {
                const script = document.createElement('script');
                script.id = 'leaflet-js';
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.head.appendChild(script);
            } else {
                const interval = setInterval(() => {
                    if (window.L) {
                        clearInterval(interval);
                        resolve(true);
                    }
                }, 100);
            }
        });
    }

    /**
     * Inizializza e renderizza una Mappa Interattiva OpenStreetMap / Leaflet con Marker Personalizzati
     * @param {string} containerId ID del div HTML dove mostrare la mappa
     * @param {Array<{title: string, address?: string, lat?: number, lng?: number}>} puntiList Lista di punti o marker
     * @param {number} [zoom=13] Livello di zoom iniziale
     */
    async renderMappaInterattivaOpenStreetMap(containerId, puntiList = [], zoom = 13) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Contenitore Mappa "${containerId}" non trovato.`);
            return null;
        }

        const pronto = await this.caricaLeafletLibrary();
        if (!pronto || !window.L) {
            console.error("Impossibile caricare la libreria Leaflet per OpenStreetMap.");
            container.innerHTML = `<div style="padding:15px; background:#fee2e2; color:#991b1b; border-radius:8px; font-weight:bold;">⚠️ Errore caricamento mappa interattiva.</div>`;
            return null;
        }

        // Resetta eventuale istanza mappa precedente nel contenitore
        if (container._leaflet_map) {
            container._leaflet_map.remove();
        }

        // Coordinate di default (Palermo Centro)
        let centerLat = 38.1157;
        let centerLng = 13.3615;

        // Se abbiamo punti, trova il primo con coordinate
        if (puntiList && puntiList.length > 0) {
            const primo = puntiList[0];
            if (primo.lat && primo.lng) {
                centerLat = primo.lat;
                centerLng = primo.lng;
            } else if (primo.title && this.presetCoords[primo.title]) {
                centerLat = this.presetCoords[primo.title].lat;
                centerLng = this.presetCoords[primo.title].lng;
            }
        }

        const map = window.L.map(containerId).setView([centerLat, centerLng], zoom);
        container._leaflet_map = map;

        // Aggiungi Layer Tile OpenStreetMap Gratuito
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Aggiungi Marker per ciascun punto
        if (Array.isArray(puntiList) && puntiList.length > 0) {
            const bounds = [];

            puntiList.forEach((punto, index) => {
                let lat = punto.lat;
                let lng = punto.lng;
                const titolo = punto.title || punto.name || `Punto ${index + 1}`;

                // Se non ci sono lat/lng numerici, cerca nei preset
                if ((!lat || !lng) && this.presetCoords[titolo]) {
                    lat = this.presetCoords[titolo].lat;
                    lng = this.presetCoords[titolo].lng;
                }

                if (lat && lng) {
                    const marker = window.L.marker([lat, lng]).addTo(map);
                    const googleNavUrl = this.getGoogleMapsUrl(punto.address || titolo);

                    marker.bindPopup(`
                        <div style="font-family:sans-serif; padding:4px;">
                            <strong style="color:#0b2545; font-size:0.95rem; display:block; margin-bottom:4px;">📍 ${escapeHtmlMap(titolo)}</strong>
                            ${punto.address ? `<div style="font-size:0.83rem; color:#475569; margin-bottom:8px;">${escapeHtmlMap(punto.address)}</div>` : ''}
                            <a href="${googleNavUrl}" target="_blank" style="background:#0284c7; color:white; padding:4px 8px; border-radius:6px; font-size:0.78rem; text-decoration:none; font-weight:bold; display:inline-block;">🧭 Indicazioni GPS</a>
                        </div>
                    `);

                    bounds.push([lat, lng]);
                }
            });

            if (bounds.length > 1) {
                map.fitBounds(bounds, { padding: [30, 30] });
            }
        }

        return map;
    }
}

function escapeHtmlMap(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Istanza globale del servizio Mappe
window.mapsService = new MapsService();
