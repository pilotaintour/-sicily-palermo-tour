/**
 * Logica Principale di Inizializzazione e Contatti - Sicily Palermo Tour
 */

document.addEventListener('DOMContentLoaded', () => {
    // Avvia il carosello sfondi della copertina Hero
    avviaHeroBgSlider();

    // Carica gli itinerari nella Home
    if (typeof caricaItinerari === 'function') {
        caricaItinerari();
    }

    // Controlla se c'è un tour da aprire in modale nei Dettagli tramite parametro URL
    const urlParams = new URLSearchParams(window.location.search);
    const openModalId = urlParams.get('openModal');
    if (openModalId && typeof apriDettagliModal === 'function') {
        setTimeout(() => apriDettagliModal(openModalId), 300);
    }

    // Inizializza l'animazione al passaggio scroll del Banner Contattaci
    inizializzaAnimazioneContattaciScroll();

    // Sincronizzazione automatica se l'admin aggiorna gli itinerari o le foto della copertina
    window.addEventListener('storage', (e) => {
        if (e.key === 'spt_itineraries' && typeof caricaItinerari === 'function') {
            caricaItinerari(typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti');
            if (window.consigliatiModaManager) window.consigliatiModaManager.renderSezioni();
        }
        if (e.key === 'spt_hero_photos' && typeof avviaHeroBgSlider === 'function') {
            avviaHeroBgSlider();
        }
    });

    window.addEventListener('spt_data_updated', () => {
        if (typeof caricaItinerari === 'function') {
            caricaItinerari(typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti');
        }
        if (window.consigliatiModaManager) window.consigliatiModaManager.renderSezioni();
        if (typeof avviaHeroBgSlider === 'function') avviaHeroBgSlider();
        if (typeof caricaFotoHeroConfig === 'function') caricaFotoHeroConfig();
    });
});

// Gestione Sfondo Copertina Hero (Foto Ufficiale unificata e scorrevole)
function avviaHeroBgSlider() {
    const sliderBox = document.getElementById('hero-bg-slider');
    if (!sliderBox) return;

    if (window._heroSliderTimer) {
        clearInterval(window._heroSliderTimer);
        window._heroSliderTimer = null;
    }

    let savedPhotos = [];
    try {
        savedPhotos = JSON.parse(localStorage.getItem('spt_hero_photos') || '[]');
    } catch (e) {}

    if (savedPhotos && Array.isArray(savedPhotos) && savedPhotos.length > 0) {
        sliderBox.innerHTML = savedPhotos.map((url, i) => `
            <div class="hero-slide ${i === 0 ? 'active' : ''}">
                <img src="${url}" alt="Copertina Tour" style="width:100%; height:100%; object-fit:cover; object-position: center 35%;">
            </div>
        `).join('');
    } else {
        const defaultPhotos = [
            'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkPa80fb7bWzzi0MNJyxopYrebJqu3gP-LZCKNRZpABdTfSB88N6THhmQb0rt8dxBGARxBqdgpUBfcUhXhoSa2YQ3Ff4VbKIgMG3B4zlJ3t1Z9ca4fx-DpDYsTkt2fD2b4S5Yn9Xw=s1600-w1600-h1200-rw',
            'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkMGPV26BT3RCm8a24p-Lq3TQqh0q8vIFFbpm18Qu4aa8cf39Nh_jMCFnWLylGRUhHMb49rFd76ZI845PQ33RXIxBHK8WOQ6ghhCzQct9FViQEnJwbrRgsx36aa3qHueLj67lA95w=s1600-w1600-h1200-rw',
            'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkMEu9jf65pXTAwJzsiDkigvj1bC-BmDUox7HtegL_cET6H47xZ50quaBWPE57qGqtwizB4KAfpyfNbWSX8EKpqMnoUfvSUonWELfU7GV7h2bI2zb5lKyOBRRQTDqL0x2_Djk2Qdw=s1600-w1600-h1200-rw',
            'https://www.sicilia.info/wp-content/uploads/sites/91/scala-dei-turchi-hd.jpg',
            'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkd6Df7P4KVpNkdGj0jXxT2XAi45tU9zhkQ4JKIQNatgYnar92eCIShP7geZGsjhrKB8NAsb5NQj6edq3rPBLUrU_ipeSh_ncYcD_svY4uf0qo2nr7toOTiklPFuHnC5gwuxDB_=s1600-w1600-h1200-rw',
            'https://www.mooway.it/public/1621965619-vedere-sanvito-1.jpg'
        ];
        sliderBox.innerHTML = defaultPhotos.map((url, i) => `
            <div class="hero-slide ${i === 0 ? 'active' : ''}">
                <img src="${url}" alt="Sicily Palermo Tour Foto ${i + 1}" style="width:100%; height:100%; object-fit:cover; object-position: center 35%;">
            </div>
        `).join('');
    }

    const slides = sliderBox.querySelectorAll('.hero-slide');
    if (!slides || slides.length <= 1) return;

    let currentSlide = 0;
    window._heroSliderTimer = setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// Gestione Form Contatti (Invio Reale via Brevo all'Email Amministratore)
async function inviaMessaggio(event) {
    event.preventDefault();

    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const messaggioInput = document.getElementById('messaggio');

    const nome = nomeInput ? nomeInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const messaggio = messaggioInput ? messaggioInput.value.trim() : '';

    if (nome && email && messaggio) {
        if (window.brevoEmailService) {
            await window.brevoEmailService.inviaEmailMessaggioContatto(nome, email, messaggio);
        }
        alert(`🎉 Grazie ${nome}! Il tuo messaggio è stato spedito all'amministratore.\n\nTi risponderemo al più presto all'indirizzo ${email}.`);
        document.getElementById('contactForm').reset();
    } else {
        alert('Per favore, compila tutti i campi obbligatori.');
    }
}

// Inizializza l'Animazione Scroll Stile PowerPoint per il Banner Contattaci
function inizializzaAnimazioneContattaciScroll() {
    const banner = document.getElementById('contact-scroll-banner');
    if (!banner) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    banner.classList.add('animate-in');
                }
            });
        }, { threshold: 0.2 });
        observer.observe(banner);
    } else {
        banner.classList.add('animate-in');
    }
}

// Scroll Fluido al modulo di contatto
function scorriAlFormContatti() {
    apriFormMessaggioScuro();
}

// Apre o chiude il form scuro per l'invio del messaggio
function apriFormMessaggioScuro() {
    const box = document.getElementById('contact-dark-form-box');
    if (box) {
        box.classList.toggle('hidden');
        if (!box.classList.contains('hidden')) {
            box.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const nomeInput = document.getElementById('nome');
            if (nomeInput) {
                setTimeout(() => nomeInput.focus(), 300);
            }
        }
    }
}
