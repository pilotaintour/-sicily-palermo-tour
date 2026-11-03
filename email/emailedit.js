/**
 * MODULO AUTONOMO EDITOR TEMPLATE EMAIL - Sicily Palermo Tour
 * Permette all'Amministratore di personalizzare in totale libertà i testi,
 * l'oggetto e le istruzioni inviate via email ai turisti.
 */

const EMAIL_SUBJECT_KEY = 'spt_email_subject';
const EMAIL_WELCOME_KEY = 'spt_email_welcome';
const EMAIL_INSTRUCTIONS_KEY = 'spt_email_instructions';
const EMAIL_FOOTER_KEY = 'spt_email_footer_text';

// Testi predefiniti di default per l'email
const DEFAULT_EMAIL_TEMPLATE = {
    subject: '[Conferma Prenotazione] Il tuo Tour a Palermo è Confermato!',
    welcomeMessage: 'Grazie per aver scelto Sicily Palermo Tour! La tua prenotazione è stata ricevuta ed è confermata.',
    instructions: '📍 Vi preghiamo di arrivare 10 minuti prima dell\'orario previsto al punto d\'incontro. Consigliamo scarpe comode e macchina fotografica.',
    footerText: 'Siamo a tua completa disposizione per qualsiasi informazione o esigenza particolare. A presto a Palermo!'
};

class EmailTemplateEditor {
    constructor() {
        this.init();
    }

    init() {
        // Inizializza i testi di default se non presenti
        if (!localStorage.getItem(EMAIL_SUBJECT_KEY)) {
            localStorage.setItem(EMAIL_SUBJECT_KEY, DEFAULT_EMAIL_TEMPLATE.subject);
        }
        if (!localStorage.getItem(EMAIL_WELCOME_KEY)) {
            localStorage.setItem(EMAIL_WELCOME_KEY, DEFAULT_EMAIL_TEMPLATE.welcomeMessage);
        }
        if (!localStorage.getItem(EMAIL_INSTRUCTIONS_KEY)) {
            localStorage.setItem(EMAIL_INSTRUCTIONS_KEY, DEFAULT_EMAIL_TEMPLATE.instructions);
        }
        if (!localStorage.getItem(EMAIL_FOOTER_KEY)) {
            localStorage.setItem(EMAIL_FOOTER_KEY, DEFAULT_EMAIL_TEMPLATE.footerText);
        }
    }

    // Recupera la configurazione attuale dei testi
    getConfig() {
        return {
            subject: localStorage.getItem(EMAIL_SUBJECT_KEY) || DEFAULT_EMAIL_TEMPLATE.subject,
            welcomeMessage: localStorage.getItem(EMAIL_WELCOME_KEY) || DEFAULT_EMAIL_TEMPLATE.welcomeMessage,
            instructions: localStorage.getItem(EMAIL_INSTRUCTIONS_KEY) || DEFAULT_EMAIL_TEMPLATE.instructions,
            footerText: localStorage.getItem(EMAIL_FOOTER_KEY) || DEFAULT_EMAIL_TEMPLATE.footerText
        };
    }

    // Salva le modifiche apportate dall'Admin
    saveConfig(subject, welcomeMessage, instructions, footerText) {
        if (subject) localStorage.setItem(EMAIL_SUBJECT_KEY, subject.trim());
        if (welcomeMessage) localStorage.setItem(EMAIL_WELCOME_KEY, welcomeMessage.trim());
        if (instructions) localStorage.setItem(EMAIL_INSTRUCTIONS_KEY, instructions.trim());
        if (footerText) localStorage.setItem(EMAIL_FOOTER_KEY, footerText.trim());
    }

    // Popola i campi nell'Admin
    caricaCampiInAdmin() {
        const conf = this.getConfig();
        const subjectEl = document.getElementById('email-template-subject');
        const welcomeEl = document.getElementById('email-template-welcome');
        const instructionsEl = document.getElementById('email-template-instructions');
        const footerEl = document.getElementById('email-template-footer');

        if (subjectEl) subjectEl.value = conf.subject;
        if (welcomeEl) welcomeEl.value = conf.welcomeMessage;
        if (instructionsEl) instructionsEl.value = conf.instructions;
        if (footerEl) footerEl.value = conf.footerText;
    }

    // Salva i campi inseriti dall'Admin
    salvaDaAdmin() {
        const subjectEl = document.getElementById('email-template-subject');
        const welcomeEl = document.getElementById('email-template-welcome');
        const instructionsEl = document.getElementById('email-template-instructions');
        const footerEl = document.getElementById('email-template-footer');

        if (subjectEl && welcomeEl && instructionsEl && footerEl) {
            this.saveConfig(
                subjectEl.value,
                welcomeEl.value,
                instructionsEl.value,
                footerEl.value
            );
            alert('✅ Template dell\'Email di Conferma aggiornato con successo!\n\nLe prossime email ai turisti verranno inviate con questi nuovi testi.');
        }
    }

    // Ripristina i testi originali
    ripristinaDefault() {
        if (confirm('Vuoi ripristinare i testi predefiniti dell\'email di conferma?')) {
            this.saveConfig(
                DEFAULT_EMAIL_TEMPLATE.subject,
                DEFAULT_EMAIL_TEMPLATE.welcomeMessage,
                DEFAULT_EMAIL_TEMPLATE.instructions,
                DEFAULT_EMAIL_TEMPLATE.footerText
            );
            this.caricaCampiInAdmin();
            alert('🔄 Testi email ripristinati a quelli predefiniti.');
        }
    }
}

// Istanza globale dell'Editor Template Email
window.emailTemplateEditor = new EmailTemplateEditor();

// Funzioni ponte globali per i pulsanti nell'Admin
function caricaTemplateEmailInAdmin() {
    if (window.emailTemplateEditor) {
        window.emailTemplateEditor.caricaCampiInAdmin();
    }
}

function salvaTemplateEmailDaAdmin() {
    if (window.emailTemplateEditor) {
        window.emailTemplateEditor.salvaDaAdmin();
    }
}

function ripristinaTemplateEmailDefault() {
    if (window.emailTemplateEditor) {
        window.emailTemplateEditor.ripristinaDefault();
    }
}
