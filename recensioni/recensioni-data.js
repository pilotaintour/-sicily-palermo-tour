/**
 * GESTIONE DATI E RENDER RECENSIONI - Sicily Palermo Tour
 * Sincronizzate in tempo reale nel Cloud con supporto Foto Multiple
 */

const RECENSIONI_STORAGE_KEY = 'spt_recensioni';

// Recensioni Iniziali Predefiniti (Vuote per lasciare spazio solo alle recensioni reali dei turisti)
const recensioniPredefinite = [];

function getRecensioni() {
    try {
        const salvate = localStorage.getItem(RECENSIONI_STORAGE_KEY);
        if (salvate) {
            const parsed = JSON.parse(salvate);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {}
    return [];
}

function salvaRecensioni(lista) {
    try {
        localStorage.setItem(RECENSIONI_STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {}
}

function processFilesToDataUrls(fileList) {
    if (!fileList || fileList.length === 0) return Promise.resolve([]);
    const promises = Array.from(fileList).slice(0, 6).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 350; // Ottimizzato per miniature piccole, carine e leggere
                    if (width > height && width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.75));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    });
    return Promise.all(promises);
}

function renderRecensioniGrid() {
    const grid = document.getElementById('recensioni-grid');
    if (!grid) return;

    const lista = getRecensioni();
    const isAdmin = localStorage.getItem('spt_admin_logged_in') === 'true';

    if (!lista || lista.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 35px 20px; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                <h3 style="color: #1b4f72; margin-bottom: 8px;">⭐ Sii il primo a lasciare una recensione!</h3>
                <p style="margin: 0; font-size: 0.95rem;">Hai partecipato ad uno dei nostri tour? Condividi la tua esperienza e le tue foto con i prossimi viaggiatori!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = lista.map(rec => {
        const stelle = '★'.repeat(rec.voto || 5) + '☆'.repeat(5 - (rec.voto || 5));
        const iniziale = rec.nome ? rec.nome.charAt(0).toUpperCase() : 'U';
        const deleteBtn = isAdmin ? `<button type="button" onclick="eliminaRecensione(${rec.id})" style="background:#ef4444; color:white; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:bold; margin-top:10px;" title="Elimina recensione">🗑️ Elimina</button>` : '';

        const fotoHtml = (rec.foto && Array.isArray(rec.foto) && rec.foto.length > 0) ? `
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px;">
                ${rec.foto.map(imgSrc => `
                    <img src="${imgSrc}" alt="Foto recensione" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; cursor: pointer; transition: transform 0.2s;" onclick="window.open(this.src)" title="Clicca per ingrandire foto">
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="recensione-card">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div class="recensione-stars">${stelle}</div>
                        ${deleteBtn}
                    </div>
                    <p class="recensione-text">"${escapeHtmlRecensione(rec.testo)}"</p>
                    ${fotoHtml}
                </div>
                <div class="recensione-author">
                    <div class="author-avatar">${iniziale}</div>
                    <div class="author-info">
                        <h4>${escapeHtmlRecensione(rec.nome)}</h4>
                        <span>${escapeHtmlRecensione(rec.data || 'Recensione verificata')}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function eliminaRecensione(id) {
    if (confirm("Vuoi eliminare questa recensione?")) {
        let lista = getRecensioni();
        lista = lista.filter(r => r.id !== id);
        salvaRecensioni(lista);

        if (window.cloudDB && typeof window.cloudDB.salvaRecensioniCloud === 'function') {
            window.cloudDB.salvaRecensioniCloud(lista);
        }

        renderRecensioniGrid();
    }
}

async function inviaNuovaRecensione(event) {
    event.preventDefault();

    const nomeInput = document.getElementById('recensione-nome');
    const votoInput = document.getElementById('recensione-voto');
    const testoInput = document.getElementById('recensione-testo');
    const fotoInput = document.getElementById('recensione-foto');

    const nome = nomeInput ? nomeInput.value.trim() : '';
    const voto = votoInput ? parseInt(votoInput.value) : 5;
    const testo = testoInput ? testoInput.value.trim() : '';
    const fileList = fotoInput ? fotoInput.files : null;

    if (!nome || !testo) {
        alert('Per favore inserisci il tuo nome e il testo della recensione.');
        return;
    }

    const btnSubmit = document.querySelector('.btn-invia-recensione');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "⏳ Elaborazione foto in corso...";
    }

    let fotoDataUrls = [];
    try {
        fotoDataUrls = await processFilesToDataUrls(fileList);
    } catch (e) {
        console.error("Errore elaborazione foto recensione:", e);
    }

    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Pubblica Recensione";
    }

    const nuoveRecensioni = getRecensioni();
    const oggi = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

    nuoveRecensioni.unshift({
        id: Date.now(),
        nome: nome,
        voto: voto,
        testo: testo,
        foto: fotoDataUrls,
        data: oggi
    });

    salvaRecensioni(nuoveRecensioni);

    // Sincronizza immediatamente nel Cloud per tutti i visitatori nel mondo
    if (window.cloudDB && typeof window.cloudDB.salvaRecensioniCloud === 'function') {
        window.cloudDB.salvaRecensioniCloud(nuoveRecensioni);
    }

    renderRecensioniGrid();

    alert('🎉 Grazie mille per la tua recensione con foto! È stata pubblicata con successo e resa visibile a tutti.');
    const formBox = document.getElementById('form-recensione');
    if (formBox) formBox.reset();
}

function escapeHtmlRecensione(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
    renderRecensioniGrid();

    // Sincronizza recensioni dal Cloud all'avvio
    if (window.cloudDB && typeof window.cloudDB.fetchRecensioniCloud === 'function') {
        window.cloudDB.fetchRecensioniCloud().then(() => {
            renderRecensioniGrid();
        });
    }
});
