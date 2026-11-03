/**
 * MODULO AUTONOMO TRADUTTORE MULTILINGUA GOOGLE
 * Sicily Palermo Tour - Selettore Lingua con Supporto per Contenuti Dinamici
 */

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'it',
        includedLanguages: 'it,en,fr,de,es,nl,pl,ru,ja,zh-CN,ar',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

// Notifica Google Translate quando gli itinerari o le tappe vengono inserite dinamicamente nel DOM
function aggiornaTraduzioneDinamica() {
    setTimeout(() => {
        const selectEl = document.querySelector('.goog-te-combo');
        if (selectEl && selectEl.value && selectEl.value !== 'it') {
            const event = new Event('change', { bubbles: true });
            selectEl.dispatchEvent(event);
        }
    }, 120);
}

// Rinomina il testo predefinito di Google Translate in "Transletor"
function personalizzaTestoTraduttore() {
    const aggiornaTesto = () => {
        const selectEl = document.querySelector('.goog-te-combo');
        if (selectEl && selectEl.options && selectEl.options.length > 0) {
            if (selectEl.options[0].text.includes('Seleziona lingua') || selectEl.options[0].text.includes('Select Language')) {
                selectEl.options[0].text = '🌐 Transletor';
            }
        }
        const gadget = document.querySelector('.goog-te-gadget span');
        if (gadget && (gadget.textContent.includes('Seleziona lingua') || gadget.textContent.includes('Select Language'))) {
            gadget.textContent = '🌐 Transletor';
        }
    };

    setTimeout(aggiornaTesto, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    personalizzaTestoTraduttore();
});

// Gestione menu a tendina personalizzato Premium per le lingue
function toggleLangDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById('langDropdownMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Chiudi il menu delle lingue se si clicca altrove
window.addEventListener('click', () => {
    const menu = document.getElementById('langDropdownMenu');
    if (menu && menu.classList.contains('show')) {
        menu.classList.remove('show');
    }
});

function changeLanguage(langCode) {
    // Imposta il cookie di Google Translate
    document.cookie = `googtrans=/it/${langCode}; path=/; domain=${document.domain}`;
    document.cookie = `googtrans=/it/${langCode}; path=/;`;

    // Aggiorna anche il combo nascosto se presente
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
    }

    location.reload();
}

// Carica lo script di Google Translate in modo asincrono
(function loadGoogleTranslateScript() {
    if (document.getElementById('google-translate-script')) return;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
})();
