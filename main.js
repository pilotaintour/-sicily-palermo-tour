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

    const defaultPhotos = [
        'copertina.jpg',
        'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=80',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Palermo-Teatro_Massimo_01.jpg/1280px-Palermo-Teatro_Massimo_01.jpg',
        'https://www.sicilia.info/wp-content/uploads/sites/91/scala-dei-turchi-hd.jpg',
        'https://www.mooway.it/public/1621965619-vedere-sanvito-1.jpg'
    ];

    let savedPhotos = [];
    try {
        savedPhotos = JSON.parse(localStorage.getItem('spt_hero_photos') || '[]');
    } catch (e) {}

    // Rimuove eventuali URL scaduti Google o non validi
    if (Array.isArray(savedPhotos) && savedPhotos.length > 0) {
        const cleanSaved = savedPhotos.filter(url => url && !url.includes('googleusercontent.com'));
        if (cleanSaved.length !== savedPhotos.length) {
            savedPhotos = cleanSaved;
            localStorage.setItem('spt_hero_photos', JSON.stringify(savedPhotos));
            if (window.cloudDB) window.cloudDB.salvaFotoHeroCloud(savedPhotos);
        }
    }

    const finalPhotos = (Array.isArray(savedPhotos) && savedPhotos.length > 0) ? savedPhotos : defaultPhotos;

    sliderBox.innerHTML = finalPhotos.map((url, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}">
            <img src="${url}" alt="Copertina Palermo Tour ${i + 1}" style="width:100%; height:100%; object-fit:cover; object-position: center 35%;">
        </div>
    `).join('');

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
