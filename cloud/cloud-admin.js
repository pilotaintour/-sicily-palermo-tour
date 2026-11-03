/**
 * MODULO AUTONOMO CLOUD ADMIN - Sicily Palermo Tour
 * Gestisce i permessi ed i salvataggi nel Cloud riservati ESCLUSIVAMENTE a pilotaintour13@gmail.com
 */

const ADMIN_AUTHORIZED_EMAIL = 'pilotaintour13@gmail.com';

class CloudAdminManager {
    constructor() {
        this.adminEmail = ADMIN_AUTHORIZED_EMAIL;
    }

    // Verifica se il browser corrente è autenticato come pilotaintour13@gmail.com
    isAuthorized() {
        const savedEmail = (localStorage.getItem('spt_admin_email') || '').toLowerCase();
        const isLoggedIn = localStorage.getItem('spt_admin_logged_in') === 'true';
        return isLoggedIn && savedEmail === this.adminEmail.toLowerCase();
    }

    // Salva e pubblica gli itinerari nel Cloud con controllo di autorizzazione
    async salvaItinerariAdmin(itinerariList) {
        if (!this.isAuthorized()) {
            console.error("⛔ Operazione Cloud negata: Soltanto pilotaintour13@gmail.com può pubblicare gli itinerari.");
            alert("⛔ Operazione negata: Devi essere autenticato come pilotaintour13@gmail.com per aggiornare gli itinerari.");
            return false;
        }

        if (window.cloudDB) {
            const success = await window.cloudDB.salvaItinerariCloud(itinerariList);
            if (success) {
                console.log("☁️ Admin [pilotaintour13@gmail.com]: Itinerari pubblicati con successo nel Cloud!");
            }
            return success;
        }
        return false;
    }

    // Salva e pubblica le foto della copertina Hero nel Cloud con controllo di autorizzazione
    async salvaFotoHeroAdmin(photosList) {
        if (!this.isAuthorized()) {
            console.error("⛔ Operazione Cloud negata: Soltanto pilotaintour13@gmail.com può aggiornare le foto di copertina.");
            alert("⛔ Operazione negata: Soltanto pilotaintour13@gmail.com può aggiornare le foto di copertina.");
            return false;
        }

        if (window.cloudDB) {
            return await window.cloudDB.salvaFotoHeroCloud(photosList);
        }
        return false;
    }

    // Forza la sincronizzazione automatica completa per l'Admin
    async forzaSincronizzazioneAdmin() {
        if (!this.isAuthorized()) return false;
        if (window.cloudDB) {
            return await window.cloudDB.fetchTuttiDatiCloud();
        }
        return false;
    }
}

// Istanza globale del controller Cloud Admin
window.cloudAdmin = new CloudAdminManager();
