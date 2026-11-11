/**
 * MODULO 3: Impostazioni del Sito, WhatsApp, Carte & Foto Copertina
 * Sicily Palermo Tour - Admin
 */

const WA_STORAGE_KEY_MODULE = 'spt_whatsapp_number';
let fotoHeroCorrenti = [];

function caricaNumeroWhatsApp() {
    const input = document.getElementById('wa-number-input');
    if (input) {
        input.value = localStorage.getItem(WA_STORAGE_KEY_MODULE) || '393000000000';
    }
}

function salvaNumeroWhatsApp() {
    const input = document.getElementById('wa-number-input');
    if (!input) return;

    const num = input.value.trim().replace(/[^0-9]/g, '');
    if (num.length >= 8) {
        localStorage.setItem(WA_STORAGE_KEY_MODULE, num);
        alert(`Numero WhatsApp salvato con successo: +${num}`);
    } else {
        alert('Inserisci un numero di telefono valido con prefisso (es. 393401234567).');
    }
}

function caricaChiaviStripe() {
    const pkInput = document.getElementById('stripe-pk-input');
    const skInput = document.getElementById('stripe-sk-input');
    const defaultPK = 'pk_test_51UJGJt383oZgJlwEDcZkzbdzODlKRxPfanpz31XrWbmJDpmQnCnsA3qPLtCIn8FoR5DlTX2rqnzAmr4UWdo1bo2k00tAdmIYH1';

    if (pkInput) pkInput.value = localStorage.getItem('spt_stripe_pk') || defaultPK;
    if (skInput) skInput.value = localStorage.getItem('spt_stripe_sk') || '';
}

function salvaChiaviStripe() {
    const pkInput = document.getElementById('stripe-pk-input');
    const skInput = document.getElementById('stripe-sk-input');

    if (pkInput && skInput) {
        const pk = pkInput.value.trim();
        const sk = skInput.value.trim();

        if (pk) localStorage.setItem('spt_stripe_pk', pk);
        if (sk) localStorage.setItem('spt_stripe_sk', sk);

        if (window.stripePayment) {
            window.stripePayment.saveKeys(pk, sk);
        }

        alert('✅ Chiavi Stripe salvate con successo nel tuo browser!');
    }
}

function caricaChiaveBrevo() {
    const input = document.getElementById('brevo-key-input');
    const senderInput = document.getElementById('brevo-sender-input');
    if (input) input.value = localStorage.getItem('spt_brevo_api_key') || '';
    if (senderInput) senderInput.value = localStorage.getItem('spt_sender_email') || 'pilotaintour13@gmail.com';
}

function salvaChiaveBrevo() {
    const input = document.getElementById('brevo-key-input');
    const senderInput = document.getElementById('brevo-sender-input');
    if (!input) return;

    const key = input.value.trim();
    const senderEmail = senderInput ? senderInput.value.trim() : '';

    if (key) {
        localStorage.setItem('spt_brevo_api_key', key);
        if (senderEmail) localStorage.setItem('spt_sender_email', senderEmail);
        if (window.brevoEmailService) {
            window.brevoEmailService.saveApiKey(key);
        }
    }
}

async function inviaEmailTestAdmin(event) {
    salvaChiaveBrevo();
    const senderInput = document.getElementById('brevo-sender-input');
    const targetEmail = senderInput ? senderInput.value.trim() : 'pilotaintour13@gmail.com';

    if (!window.brevoEmailService) {
        alert('⚠️ Modulo Brevo non pronto. Ricarica la pagina e riprova.');
        return;
    }

    const btn = event ? event.target : null;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Invio email di test in corso...';
    }

    try {
        const res = await window.brevoEmailService.testEmailBrevo(targetEmail);
        if (res && res.success) {
            alert(`🎉 EMAIL DI TEST INVIATA CON SUCCESSO VIA BREVO!\n\nMittente: ${res.senderEmail}\nDestinatario: ${res.targetEmail}\nID Messaggio Brevo: ${res.messageId}\n\nControlla adesso la tua casella di posta (${res.targetEmail}) compresa la cartella Spam/Promozioni!`);
        } else {
            alert(`⚠️ IMPOSSIBILE INVIARE L'EMAIL DA BREVO:\n\nEsito restituito da Brevo: "${res.error || 'Errore di configurazione'}"\n\n💡 SOLUZIONE RAPIDA:\n1. Se l'errore dice "Sender email is not verified", accedi a Brevo -> Senders & IP e conferma l'email "${targetEmail}".\n2. Assicurati che l'API Key xkeysib-... sia attiva.`);
        }
    } catch (err) {
        alert(`❌ Errore durante l'invio dell'email di test: ${err.message || err}`);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '🧪 Invia Email di Test Ora';
        }
    }
}
window.inviaEmailTestAdmin = inviaEmailTestAdmin;

// GESTIONE FOTO SFONDO COPERTINA HOMEPAGE (HERO SLIDER)
function caricaFotoHeroConfig() {
    try {
        fotoHeroCorrenti = JSON.parse(localStorage.getItem('spt_hero_photos') || '[]');
    } catch (e) {
        fotoHeroCorrenti = [];
    }

    if (Array.isArray(fotoHeroCorrenti) && fotoHeroCorrenti.length > 0) {
        fotoHeroCorrenti = fotoHeroCorrenti.filter(url => url && !url.includes('googleusercontent.com'));
    }

    if (!fotoHeroCorrenti || fotoHeroCorrenti.length === 0) {
        fotoHeroCorrenti = [
            'copertina.jpg',
            'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=80',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Palermo-Teatro_Massimo_01.jpg/1280px-Palermo-Teatro_Massimo_01.jpg',
            'https://www.sicilia.info/wp-content/uploads/sites/91/scala-dei-turchi-hd.jpg',
            'https://www.mooway.it/public/1621965619-vedere-sanvito-1.jpg'
        ];
    }
    renderGalleriaHeroAdmin();
}

function gestisciCaricamentoFotoHero(event) {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    let completati = 0;
    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 500;
                let width = img.width;
                let height = img.height;
                if (width > height && width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                } else if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                fotoHeroCorrenti.push(canvas.toDataURL('image/jpeg', 0.65));
                completati++;
                if (completati === files.length) {
                    renderGalleriaHeroAdmin();
                    event.target.value = '';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function aggiungiUrlFotoHero() {
    const input = document.getElementById('hero-photo-url-input');
    if (!input) return;
    const url = input.value.trim();
    if (url) {
        fotoHeroCorrenti.push(url);
        input.value = '';
        renderGalleriaHeroAdmin();
    }
}

function rimuoviFotoHero(index) {
    fotoHeroCorrenti.splice(index, 1);
    renderGalleriaHeroAdmin();
}

function renderGalleriaHeroAdmin() {
    const container = document.getElementById('hero-gallery-preview');
    if (!container) return;

    if (fotoHeroCorrenti.length === 0) {
        container.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; grid-column:1/-1;">Nessuna foto copertina impostata.</p>';
        return;
    }

    container.innerHTML = fotoHeroCorrenti.map((imgUrl, idx) => `
        <div style="position:relative; width:130px; height:85px; border-radius:8px; overflow:hidden; border:1.5px solid #cbd5e1; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
            <img src="${imgUrl}" alt="Hero ${idx + 1}" style="width:100%; height:100%; object-fit:cover;">
            <button type="button" onclick="rimuoviFotoHero(${idx})" style="position:absolute; top:4px; right:4px; background:rgba(239,68,68,0.9); color:white; border:none; border-radius:50%; width:22px; height:22px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.75rem;" title="Rimuovi foto">✕</button>
        </div>
    `).join('');
}

async function salvaFotoHero() {
    if (fotoHeroCorrenti.length === 0) {
        alert("Inserisci almeno una foto per lo sfondo della copertina.");
        return;
    }
    localStorage.setItem('spt_hero_photos', JSON.stringify(fotoHeroCorrenti));
    if (typeof avviaHeroBgSlider === 'function') {
        avviaHeroBgSlider();
    }
    if (window.cloudDB) {
        await window.cloudDB.salvaFotoHeroCloud(fotoHeroCorrenti);
    }
    window.dispatchEvent(new Event('spt_data_updated'));
    alert(`☁️ ${fotoHeroCorrenti.length} foto della copertina pubblicate nel Cloud con successo! Ora la pagina principale è aggiornata in tempo reale.`);
}

function toggleSettingBox(boxId) {
    const box = document.getElementById(boxId);
    const arrow = document.getElementById('arrow-' + boxId);

    if (box) {
        if (box.classList.contains('hidden')) {
            box.classList.remove('hidden');
            if (arrow) arrow.textContent = '▲';
            if (boxId === 'box-stripe') caricaChiaviStripe();
            if (boxId === 'box-brevo') caricaChiaveBrevo();
            if (boxId === 'box-hero-photos') caricaFotoHeroConfig();
            if (boxId === 'box-email-template') {
                if (typeof caricaTemplateEmailInAdmin === 'function') caricaTemplateEmailInAdmin();
            }
        } else {
            box.classList.add('hidden');
            if (arrow) arrow.textContent = '▼';
        }
    }
}
