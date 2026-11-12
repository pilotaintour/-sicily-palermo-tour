/**
 * MODULO 1.3: Gestione Galleria Foto, Compressione Immagini e Tappe del Tour
 * Sicily Palermo Tour - Admin Itinerari
 */

function gestisciCaricamentoFotoMultiple(event) {
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
                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.60);
                fotoItinerarioCorrenti.push(compressedDataUrl);

                completati++;
                if (completati === files.length) {
                    renderGalleriaAnteprima();
                    event.target.value = '';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function aggiungiUrlFoto() {
    const urlInput = document.getElementById('image-url');
    if (!urlInput) return;

    const url = urlInput.value.trim();
    if (url) {
        fotoItinerarioCorrenti.push(url);
        urlInput.value = '';
        renderGalleriaAnteprima();
    }
}

function rimuoviFotoGalleria(index) {
    fotoItinerarioCorrenti.splice(index, 1);
    renderGalleriaAnteprima();
}

function renderGalleriaAnteprima() {
    const container = document.getElementById('gallery-preview-container');
    if (!container) return;

    if (fotoItinerarioCorrenti.length === 0) {
        container.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; grid-column:1/-1;">Nessuna foto ancora aggiunta.</p>';
        return;
    }

    const htmlHeader = `<div style="grid-column:1/-1; font-weight:bold; font-size:0.85rem; color:#1b4f72;">🖼️ ${fotoItinerarioCorrenti.length} foto pronte per la galleria del tour:</div>`;

    container.innerHTML = htmlHeader + fotoItinerarioCorrenti.map((imgUrl, index) => `
        <div class="gallery-thumb-item">
            <img src="${imgUrl}" alt="Foto ${index + 1}">
            <button type="button" class="gallery-thumb-remove" onclick="rimuoviFotoGalleria(${index})" title="Rimuovi foto">✕</button>
        </div>
    `).join('');
}

function renderCampiTappe() {
    const container = document.getElementById('tappe-input-list');
    if (!container) return;

    if (tappeCorrenti.length === 0) {
        tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti storici'];
    }

    container.innerHTML = tappeCorrenti.map((tappaText, idx) => `
        <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-weight: bold; font-size: 0.85rem; color: #e67e22; width: 24px; text-align: center;">${idx + 1}.</span>
            <input type="text" class="tappa-input" value="${escapeHtmlAdmin(tappaText)}" placeholder="Es. Tappa ${idx + 1}" oninput="aggiornaTappa(${idx}, this.value)" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
            ${tappeCorrenti.length > 1 ? `<button type="button" class="btn-danger btn-small" onclick="rimuoviCampoTappa(${idx})" title="Rimuovi tappa">✕</button>` : ''}
        </div>
    `).join('');
}

function aggiornaTappa(index, val) {
    tappeCorrenti[index] = val;
}

function aggiungiCampoTappa() {
    tappeCorrenti.push('');
    renderCampiTappe();
    setTimeout(() => {
        const inputs = document.querySelectorAll('.tappa-input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }, 50);
}

function rimuoviCampoTappa(index) {
    tappeCorrenti.splice(index, 1);
    renderCampiTappe();
}

window.gestisciCaricamentoFotoMultiple = gestisciCaricamentoFotoMultiple;
window.aggiungiUrlFoto = aggiungiUrlFoto;
window.rimuoviFotoGalleria = rimuoviFotoGalleria;
window.renderGalleriaAnteprima = renderGalleriaAnteprima;
window.renderCampiTappe = renderCampiTappe;
window.aggiornaTappa = aggiornaTappa;
window.aggiungiCampoTappa = aggiungiCampoTappa;
window.rimuoviCampoTappa = rimuoviCampoTappa;
