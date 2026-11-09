/**
 * MODULO AUTONOMO DATABASE CLOUD - FIREBASE REALTIME DATABASE (GOOGLE)
 * Sicily Palermo Tour - Sincronizzazione in Tempo Reale con Protezione Eliminazioni
 */

const FIREBASE_DB_URL = 'https://sicilypalermotour-default-rtdb.europe-west1.firebasedatabase.app/spt_database.json';

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

class CloudDatabaseManager {
    constructor() {
        this.dbUrl = FIREBASE_DB_URL;
        this.syncInterval = null;
        this.isSaving = false;
        this.lastSaveTime = 0;

        this.initAutoSync();
    }

    initAutoSync() {
        setTimeout(() => this.fetchTuttiDatiCloud(), 300);

        if (!this.syncInterval) {
            this.syncInterval = setInterval(() => {
                this.fetchTuttiDatiCloud();
            }, 6000);
        }

        window.addEventListener('focus', () => this.fetchTuttiDatiCloud());
        window.addEventListener('online', () => this.fetchTuttiDatiCloud());
    }

    _getCurrentLocalData() {
        let itinerari = [];
        let heroPhotos = [];
        let bookings = [];
        let reviews = [];
        let promoters = [];
        try { itinerari = JSON.parse(localStorage.getItem('spt_itineraries') || '[]'); } catch (e) {}
        try { heroPhotos = JSON.parse(localStorage.getItem('spt_hero_photos') || '[]'); } catch (e) {}
        try { bookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]'); } catch (e) {}
        try { reviews = JSON.parse(localStorage.getItem('spt_recensioni') || '[]'); } catch (e) {}
        try { promoters = JSON.parse(localStorage.getItem('spt_promoters') || '[]'); } catch (e) {}

        itinerari = pulisciVecchiItinerariDemo(itinerari);
        return { itinerari, heroPhotos, bookings, reviews, promoters };
    }

    async fetchTuttiDatiCloud() {
        // Se un salvataggio/eliminazione locale è stato effettuato negli ultimi 8 secondi, rispetta lo stato locale ed evita sovrascritture
        if (this.isSaving || (Date.now() - this.lastSaveTime < 8000)) {
            return null;
        }

        try {
            const timestamp = Date.now();
            const res = await fetch(`${this.dbUrl}?nocache=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            if (res.ok && !this.isSaving && (Date.now() - this.lastSaveTime >= 8000)) {
                const record = (await res.json()) || {};

                // 1. Sincronizza Itinerari
                if (record.itinerari && Array.isArray(record.itinerari) && record.itinerari.length > 0) {
                    const itinerariPuliti = pulisciVecchiItinerariDemo(record.itinerari);
                    if (itinerariPuliti.length > 0) {
                        localStorage.setItem('spt_itineraries', JSON.stringify(itinerariPuliti));

                        if (typeof renderItinerariGrid === 'function') {
                            const cat = typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti';
                            renderItinerariGrid(itinerariPuliti, cat);
                        }
                        if (typeof caricaElencoItinerari === 'function') caricaElencoItinerari();
                        if (window.consigliatiModaManager) window.consigliatiModaManager.renderSezioni();
                    }
                }

                // 2. Sincronizza Hero Photos (Foto Sfondo Copertina)
                if (record.heroPhotos && Array.isArray(record.heroPhotos)) {
                    localStorage.setItem('spt_hero_photos', JSON.stringify(record.heroPhotos));
                    if (typeof avviaHeroBgSlider === 'function') avviaHeroBgSlider();
                    if (typeof caricaFotoHeroConfig === 'function') caricaFotoHeroConfig();
                }

                // 3. Sincronizza Prenotazioni (Rispetta lo stato pulito dal Cloud)
                if (record.bookings && Array.isArray(record.bookings)) {
                    localStorage.setItem('spt_bookings', JSON.stringify(record.bookings));

                    if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
                    if (typeof caricaSezioneTransazioni === 'function') caricaSezioneTransazioni();
                    if (typeof caricaDashboardPartner === 'function') caricaDashboardPartner();
                }

                // 4. Sincronizza Recensioni
                if (record.reviews && Array.isArray(record.reviews) && record.reviews.length > 0) {
                    localStorage.setItem('spt_recensioni', JSON.stringify(record.reviews));
                    if (typeof renderRecensioniGrid === 'function') renderRecensioniGrid();
                    if (typeof caricaRecensioniAdmin === 'function') caricaRecensioniAdmin();
                }

                // 5. Sincronizza Rivenditori / Promoters
                if (record.promoters && Array.isArray(record.promoters)) {
                    localStorage.setItem('spt_promoters', JSON.stringify(record.promoters));
                    if (typeof caricaPromotersAdmin === 'function') caricaPromotersAdmin();
                    if (typeof caricaDashboardPartner === 'function') caricaDashboardPartner();
                }

                return record;
            }
        } catch (e) {
            // Silenzioso
        }
        return null;
    }

    async fetchItinerariCloud() {
        const record = await this.fetchTuttiDatiCloud();
        if (record && record.itinerari && Array.isArray(record.itinerari) && record.itinerari.length > 0) {
            return pulisciVecchiItinerariDemo(record.itinerari);
        }
        return this._getCurrentLocalData().itinerari;
    }

    async fetchRecensioniCloud() {
        const record = await this.fetchTuttiDatiCloud();
        if (record && record.reviews && Array.isArray(record.reviews) && record.reviews.length > 0) {
            return record.reviews;
        }
        return this._getCurrentLocalData().reviews;
    }

    async salvaTuttiDatiCloud(dataObj) {
        if (!dataObj || typeof dataObj !== 'object') return false;

        this.isSaving = true;
        this.lastSaveTime = Date.now();

        try {
            const patchPayload = {
                updatedAt: new Date().toISOString()
            };

            if (typeof dataObj.itinerari !== 'undefined') {
                const cleanItinerari = pulisciVecchiItinerariDemo(dataObj.itinerari);
                localStorage.setItem('spt_itineraries', JSON.stringify(cleanItinerari));
                patchPayload.itinerari = cleanItinerari;

                if (typeof renderItinerariGrid === 'function') {
                    const cat = typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti';
                    renderItinerariGrid(cleanItinerari, cat);
                }
                if (window.consigliatiModaManager) window.consigliatiModaManager.renderSezioni();
            }
            if (typeof dataObj.heroPhotos !== 'undefined') {
                localStorage.setItem('spt_hero_photos', JSON.stringify(dataObj.heroPhotos));
                patchPayload.heroPhotos = dataObj.heroPhotos;

                if (typeof avviaHeroBgSlider === 'function') avviaHeroBgSlider();
                if (typeof caricaFotoHeroConfig === 'function') caricaFotoHeroConfig();
            }
            if (typeof dataObj.bookings !== 'undefined') {
                localStorage.setItem('spt_bookings', JSON.stringify(dataObj.bookings));
                patchPayload.bookings = dataObj.bookings;
            }
            if (typeof dataObj.reviews !== 'undefined') {
                localStorage.setItem('spt_recensioni', JSON.stringify(dataObj.reviews));
                patchPayload.reviews = dataObj.reviews;
            }
            if (typeof dataObj.promoters !== 'undefined') {
                localStorage.setItem('spt_promoters', JSON.stringify(dataObj.promoters));
                patchPayload.promoters = dataObj.promoters;
            }

            // Notifica tutti i componenti dell'applicazione dell'avvenuto aggiornamento dati
            window.dispatchEvent(new Event('spt_data_updated'));

            const res = await fetch(this.dbUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patchPayload)
            });

            if (res.ok) {
                console.log("🔥 Dati pubblicati ed eliminazioni sincronizzate con successo nel Cloud!");
                this.isSaving = false;
                this.lastSaveTime = Date.now();
                return true;
            }
        } catch (e) {
            console.error("Errore salvataggio Firebase:", e);
        } finally {
            this.isSaving = false;
        }
        return false;
    }

    async salvaItinerariCloud(itinerariList) {
        return this.salvaTuttiDatiCloud({ itinerari: itinerariList });
    }

    async salvaFotoHeroCloud(heroPhotosList) {
        return this.salvaTuttiDatiCloud({ heroPhotos: heroPhotosList });
    }

    async salvaRecensioniCloud(recensioniList) {
        return this.salvaTuttiDatiCloud({ reviews: recensioniList });
    }

    async salvaPrenotazioniCloud(bookingsList) {
        return this.salvaTuttiDatiCloud({ bookings: bookingsList });
    }
}

// Istanza globale gestore Database Cloud con auto-sync avviato
window.cloudDB = new CloudDatabaseManager();
