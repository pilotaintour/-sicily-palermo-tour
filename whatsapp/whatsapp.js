/**
 * Componente WhatsApp - Sicily Palermo Tour
 */

const WA_STORAGE_KEY = 'spt_whatsapp_number';
const DEFAULT_WA_NUMBER = '393000000000'; // Sostituibile dall'Admin in qualsiasi momento

// Recupera il numero configurato dall'Admin
function getNumeroWhatsApp() {
    const saved = localStorage.getItem(WA_STORAGE_KEY);
    return saved ? saved.replace(/[^0-9]/g, '') : DEFAULT_WA_NUMBER;
}

// Apre la chat di WhatsApp con messaggio opzionale
function apriChatWhatsApp(messaggioPersonalizzato) {
    const num = getNumeroWhatsApp();
    const msg = messaggioPersonalizzato || "Ciao! Vorrei maggiori informazioni sui vostri tour a Palermo.";
    const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}
