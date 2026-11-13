/**
 * STEP 3: Dati Personali Completi, Lingua e Indirizzo di Fatturazione / Residenza
 * Sicily Palermo Tour - Flusso Diretto con Avanzamento Garantito allo Step 4
 */

class Step3Dati {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onComplete = options.onComplete || null;
        this.onPrev = options.onPrev || null;
        this.tourData = options.tourData || null;

        this.adults = 2;
        this.children = 0;

        this.init();
    }

    init() {
        if (!this.container) return;
        this.renderForm();
    }

    setPartecipanti(adults, children) {
        this.adults = parseInt(adults, 10) || 1;
        this.children = parseInt(children, 10) || 0;
        this.renderForm();
    }

    renderSelectDataNascita(idPrefix, isChild) {
        const currentYear = new Date().getFullYear();

        let yearsHtml = '<option value="">Anno (Opzionale)</option>';
        if (isChild) {
            for (let y = currentYear - 3; y >= currentYear - 12; y--) {
                yearsHtml += `<option value="${y}">${y}</option>`;
            }
        } else {
            for (let y = currentYear - 13; y >= 1920; y--) {
                yearsHtml += `<option value="${y}">${y}</option>`;
            }
        }

        let daysHtml = '<option value="">Giorno</option>';
        for (let d = 1; d <= 31; d++) {
            const dStr = String(d).padStart(2, '0');
            daysHtml += `<option value="${dStr}">${d}</option>`;
        }

        const mesi = [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ];
        let monthsHtml = '<option value="">Mese</option>';
        mesi.forEach((m, idx) => {
            const mStr = String(idx + 1).padStart(2, '0');
            monthsHtml += `<option value="${mStr}">${m}</option>`;
        });

        return `
            <div style="display: grid; grid-template-columns: 1fr 1.3fr 1.1fr; gap: 8px;">
                <select id="${idPrefix}-day" style="padding: 10px 8px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.92rem; background: #ffffff; color: #1e293b; box-sizing: border-box;">
                    ${daysHtml}
                </select>
                <select id="${idPrefix}-month" style="padding: 10px 8px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.92rem; background: #ffffff; color: #1e293b; box-sizing: border-box;">
                    ${monthsHtml}
                </select>
                <select id="${idPrefix}-year" style="padding: 10px 8px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.92rem; background: #ffffff; color: #1e293b; box-sizing: border-box;">
                    ${yearsHtml}
                </select>
            </div>
        `;
    }

    renderForm() {
        if (!this.container) return;

        const totalePartecipanti = this.adults + this.children;

        let html = `
            <div class="step-card-header">
                🛡️ Step 3: Dati Referente, Partecipanti e Fatturazione
            </div>

            <div style="background: #e0f2fe; padding: 12px 16px; border-radius: 10px; border: 1px solid #bae6fd; margin-bottom: 20px; font-size: 0.88rem; color: #0369a1; font-weight: 600;">
                📋 Inserisci i dati del referente principale ed i nomi dei ${totalePartecipanti} partecipanti (${this.adults} Adulti${this.children > 0 ? `, ${this.children} Bambini` : ''}) per la lista passeggeri e la conferma della prenotazione.
            </div>

            <!-- PARTECIPANTE 1: REFERENTE PRINCIPALE -->
            <div style="background: #ffffff; border: 2px solid #0b2545; border-radius: 16px; padding: 22px; margin-bottom: 22px; box-shadow: 0 8px 20px rgba(11, 37, 69, 0.08); position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <span style="background: linear-gradient(135deg, #0b2545, #134074); color: #ffffff; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.3px;">
                        ⭐ PASSEGGERO 1 - REFERENTE PRINCIPALE
                    </span>
                    <span style="font-size: 0.8rem; color: #d97706; font-weight: 700; background: #fef3c7; padding: 3px 10px; border-radius: 12px;">Capogruppo Tour</span>
                </div>

                <div class="form-group" style="margin-bottom: 14px;">
                    <label for="step3-name-1" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">📛 Nome e Cognome Completo Referente</label>
                    <input type="text" id="step3-name-1" placeholder="Es. Mario Rossi" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                    <div>
                        <label style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">🎂 Data di Nascita (Opzionale)</label>
                        ${this.renderSelectDataNascita('step3-dob-1', false)}
                    </div>
                    <div>
                        <label for="step3-origin-1" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">📍 Città / Provenienza (Opzionale)</label>
                        <input type="text" id="step3-origin-1" placeholder="Es. Milano / Roma" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                    <div>
                        <label for="step3-lead-email" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.92rem; color: #0f172a;">📧 Email di Conferma (Dove ricevere i biglietti)</label>
                        <input type="email" id="step3-lead-email" placeholder="mario.rossi@example.com" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label for="step3-lead-phone" style="display: block; font-weight: 700; margin-bottom: 6px; color: #0f172a;">📞 Telefono / WhatsApp (con Prefisso)</label>
                        <input type="tel" id="step3-lead-phone" placeholder="+39 340 1234567" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 1rem; box-sizing: border-box;">
                    </div>
                </div>

                <!-- LINGUA PREFERITA E FATTURAZIONE -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; background: #fafcfd; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <div>
                        <label for="step3-lead-language" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #0b2545;">🌐 Lingua Preferita per la Guida</label>
                        <select id="step3-lead-language" style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 0.95rem; background: white;">
                            <option value="Italiano" selected>🇮🇹 Italiano</option>
                            <option value="English">🇬🇧 English</option>
                            <option value="Español">🇪🇸 Español</option>
                            <option value="Français">Français</option>
                            <option value="Deutsch">🇩🇪 Deutsch</option>
                        </select>
                    </div>
                    <div>
                        <label for="step3-lead-country" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #0b2545;">🌍 Nazione di Residenza</label>
                        <input type="text" id="step3-lead-country" placeholder="Es. Italia / Francia / USA" value="Italia" style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 8px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                    </div>
                </div>

                <!-- INDIRIZZO FATTURAZIONE -->
                <div style="background: #fafcfd; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
                    <label style="display: block; font-weight: 700; margin-bottom: 8px; font-size: 0.9rem; color: #0b2545;">🏠 Indirizzo di Residenza / Fatturazione (Opzionale)</label>
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px;">
                        <input type="text" id="step3-lead-address" placeholder="Via / Piazza e Numero Civico" style="padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem;">
                        <input type="text" id="step3-lead-city" placeholder="Città" style="padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem;">
                        <input type="text" id="step3-lead-zip" placeholder="CAP" style="padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem;">
                    </div>
                </div>

                <div>
                    <label for="step3-notes-1" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem; color: #475569;">📝 Note, Intolleranze Alimentari o Esigenze Particolari (Opzionale)</label>
                    <input type="text" id="step3-notes-1" placeholder="Es. Allergie, intolleranze cibo, passeggino, esigenze speciali..." style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 0.92rem; box-sizing: border-box;">
                </div>
            </div>
        `;

        // PARTECIPANTI AGGIUNTIVI (DA 2 A N)
        let partCounter = 2;

        for (let a = 2; a <= this.adults; a++) {
            html += `
                <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 18px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                        <span style="background: #f1f5f9; color: #334155; padding: 4px 12px; border-radius: 16px; font-size: 0.83rem; font-weight: 800;">
                            🧑 PASSEGGERO ${partCounter} - ADULTO (Opzionale)
                        </span>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label for="step3-name-${partCounter}" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #334155;">📛 Nome e Cognome Completo</label>
                        <input type="text" id="step3-name-${partCounter}" placeholder="Nome e Cognome Partecipante ${partCounter}" style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #334155;">🎂 Data di Nascita</label>
                            ${this.renderSelectDataNascita(`step3-dob-${partCounter}`, false)}
                        </div>
                        <div>
                            <label for="step3-origin-${partCounter}" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #334155;">📍 Città / Provenienza</label>
                            <input type="text" id="step3-origin-${partCounter}" placeholder="Es. Roma / Francia" style="padding: 11px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                        </div>
                    </div>

                    <div>
                        <label for="step3-notes-${partCounter}" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem; color: #64748b;">📝 Note / Esigenze Particolari</label>
                        <input type="text" id="step3-notes-${partCounter}" placeholder="Es. Allergie, intolleranze..." style="padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 10px; width: 100%; font-size: 0.92rem; box-sizing: border-box;">
                    </div>
                </div>
            `;
            partCounter++;
        }

        for (let c = 1; c <= this.children; c++) {
            html += `
                <div style="background: #fffbf5; border: 1.5px solid #fed7aa; border-radius: 16px; padding: 20px; margin-bottom: 18px; box-shadow: 0 6px 16px rgba(217, 119, 6, 0.04);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #ffedd5; padding-bottom: 8px;">
                        <span style="background: #ffedd5; color: #c2410c; padding: 4px 12px; border-radius: 16px; font-size: 0.83rem; font-weight: 800;">
                            🧒 PASSEGGERO ${partCounter} - BAMBINO (4-12 Anni)
                        </span>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label for="step3-name-${partCounter}" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #9a3412;">📛 Nome e Cognome Completo</label>
                        <input type="text" id="step3-name-${partCounter}" placeholder="Nome e Cognome Bambino ${partCounter}" style="padding: 11px; border: 1.5px solid #fed7aa; border-radius: 10px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #9a3412;">🎂 Data di Nascita</label>
                            ${this.renderSelectDataNascita(`step3-dob-${partCounter}`, true)}
                        </div>
                        <div>
                            <label for="step3-origin-${partCounter}" style="display: block; font-weight: 700; margin-bottom: 6px; font-size: 0.9rem; color: #9a3412;">📍 Città / Provenienza</label>
                            <input type="text" id="step3-origin-${partCounter}" placeholder="Es. Torino / Spagna" style="padding: 11px; border: 1.5px solid #fed7aa; border-radius: 10px; width: 100%; font-size: 0.95rem; box-sizing: border-box;">
                        </div>
                    </div>

                    <div>
                        <label for="step3-notes-${partCounter}" style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem; color: #c2410c;">📝 Note / Esigenze Particolari</label>
                        <input type="text" id="step3-notes-${partCounter}" placeholder="Es. Passeggino, intolleranze..." style="padding: 10px; border: 1.5px solid #fed7aa; border-radius: 10px; width: 100%; font-size: 0.92rem; box-sizing: border-box;">
                    </div>
                </div>
            `;
            partCounter++;
        }

        html += `
            <!-- ACCETTAZIONE TERMINI E CONDIZIONI & REGOLAMENTO PENALI -->
            <div id="step3-terms-card" style="background: #fafcfd; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 18px; margin-bottom: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <!-- Avviso Condizioni Contrattuali -->
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px; margin-bottom: 14px; font-size: 0.88rem; color: #0b2545; line-height: 1.5;">
                    <div style="font-weight: 800; color: #dc2626; font-size: 0.92rem; margin-bottom: 8px;">🔴 Con il versamento della quota si intende accettato ogni singolo punto inserito incluse le condizioni ed il regolamento:</div>
                    <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; color: #334155; font-size: 0.85rem;">
                        <li><strong>Numero Minimo:</strong> La partenza è garantita al raggiungimento del numero minimo di 35 partecipanti.</li>
                        <li><strong>Annullamento:</strong> Nel caso di mancato raggiungimento dei numeri, Sicily Palermo Tour può annullare il trasferimento fino al giorno prima della partenza con rimborso completo della quota versata, senza obbligo di riprotezione.</li>
                        <li><strong>Meteo:</strong> Non sono previste riduzioni o rimborsi nel caso in cui le condizioni meteorologiche siano avverse.</li>
                        <li><strong>Assicurazione & Rimborsi:</strong> Non è ammesso alcun cambio data e la quota non è rimborsabile. L'azienda si solleva da ogni responsabilità in caso di rifiuto dell'assicurazione medico/bagaglio o annullamento.</li>
                        <li><strong>Sostituzione:</strong> È ammessa la sostituzione del partecipante anche la mattina stessa della partenza (esclusi i voli in aereo).</li>
                        <li><strong>Puntualità:</strong> In caso di ritardo o mancata presentazione gli accompagnatori non sono tenuti ad aspettare e non ci sarà in qualsiasi caso nessun rimborso.</li>
                    </ul>
                </div>

                <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; font-size: 0.92rem; color: #0b2545; font-weight: 700;">
                    <input type="checkbox" id="step3-terms-check" style="width: 22px; height: 22px; accent-color: #0b2545; margin-top: 2px; cursor: pointer;">
                    <span style="line-height: 1.5;">
                        Dichiaro di aver letto ed accetto integralmente i <a href="termini-condizioni.html" target="_blank" onclick="window.open('termini-condizioni.html', '_blank', 'width=800,height=750'); return false;" style="color: #0369a1; text-decoration: underline; font-weight: 800;">Termini e Condizioni di Servizio</a>, le <a href="termini-condizioni.html" target="_blank" onclick="window.open('termini-condizioni.html', '_blank', 'width=800,height=750'); return false;" style="color: #d97706; text-decoration: underline; font-weight: 800;">Condizioni Contrattuali</a> e l'Informativa sulla Privacy *
                    </span>
                </label>
            </div>

            <div class="step-nav-bar" style="margin-top: 25px;">
                <button type="button" class="btn-nav-prev" id="btn-step3-prev">
                    ← Indietro
                </button>
                <button type="button" class="btn-nav-next" id="btn-step3-next">
                    Avanti: Riepilogo & Conferma →
                </button>
            </div>
        `;

        this.container.innerHTML = html;

        this.container.querySelector('#btn-step3-prev').onclick = () => {
            if (typeof this.onPrev === 'function') this.onPrev();
        };

        this.container.querySelector('#btn-step3-next').onclick = () => this.validaEProsegui();
    }

    validaEProsegui() {
        try {
            const leadNameEl = this.container.querySelector('#step3-name-1');
            const leadEmailEl = this.container.querySelector('#step3-lead-email');
            const leadPhoneEl = this.container.querySelector('#step3-lead-phone');
            const termsCheck = this.container.querySelector('#step3-terms-check');

            let leadName = leadNameEl ? leadNameEl.value.trim() : '';
            let leadEmail = leadEmailEl ? leadEmailEl.value.trim() : '';
            let leadPhone = leadPhoneEl ? leadPhoneEl.value.trim() : '';

            if (!leadName) leadName = 'Cliente';
            if (!leadEmail || !leadEmail.includes('@')) leadEmail = 'cliente@example.com';
            if (!leadPhone) leadPhone = '+39 3331234567';

            if (termsCheck && !termsCheck.checked) {
                alert('⚠️ Per favore accetta i Termini e Condizioni di Servizio per proseguire.');
                termsCheck.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (termsCheck.parentElement) {
                    termsCheck.parentElement.style.color = '#dc2626';
                }
                return;
            }
            if (termsCheck && termsCheck.parentElement) {
                termsCheck.parentElement.style.color = '#0b2545';
            }

            const leadLanguage = this.container.querySelector('#step3-lead-language') ? this.container.querySelector('#step3-lead-language').value : 'Italiano';
            const leadCountry = this.container.querySelector('#step3-lead-country') ? this.container.querySelector('#step3-lead-country').value.trim() : 'Italia';
            const leadAddress = this.container.querySelector('#step3-lead-address') ? this.container.querySelector('#step3-lead-address').value.trim() : '';
            const leadCity = this.container.querySelector('#step3-lead-city') ? this.container.querySelector('#step3-lead-city').value.trim() : '';
            const leadZip = this.container.querySelector('#step3-lead-zip') ? this.container.querySelector('#step3-lead-zip').value.trim() : '';

            const totalePartecipanti = (parseInt(this.adults, 10) || 1) + (parseInt(this.children, 10) || 0);
            const listaPartecipanti = [];

            for (let i = 1; i <= totalePartecipanti; i++) {
                const nameEl = this.container.querySelector(`#step3-name-${i}`);
                const dayEl = this.container.querySelector(`#step3-dob-${i}-day`);
                const monthEl = this.container.querySelector(`#step3-dob-${i}-month`);
                const yearEl = this.container.querySelector(`#step3-dob-${i}-year`);
                const originEl = this.container.querySelector(`#step3-origin-${i}`);
                const notesEl = this.container.querySelector(`#step3-notes-${i}`);

                const isLead = (i === 1);
                const isChild = i > this.adults;
                let typeLabel = isLead ? 'Referente Principale' : (isChild ? 'Bambino' : 'Adulto');

                let nameVal = nameEl ? nameEl.value.trim() : '';

                const dayVal = dayEl ? dayEl.value : '';
                const monthVal = monthEl ? monthEl.value : '';
                const yearVal = yearEl ? yearEl.value : '';
                let originVal = originEl ? originEl.value.trim() : '';
                if (!originVal) originVal = leadCountry || 'Italia';

                const notesVal = notesEl ? notesEl.value.trim() : '';
                const dobFormatted = (dayVal && monthVal && yearVal) ? `${dayVal}/${monthVal}/${yearVal}` : 'Non specificata';

                listaPartecipanti.push({
                    number: i,
                    name: nameVal || (isLead ? (leadName || 'Referente') : `Ospite ${i} (${typeLabel})`),
                    dob: dobFormatted,
                    origin: originVal,
                    notes: notesVal,
                    type: typeLabel
                });
            }

            if (typeof this.onComplete === 'function') {
                this.onComplete({
                    customerName: leadName,
                    customerEmail: leadEmail,
                    customerPhone: leadPhone,
                    selectedPickup: (this.tourData ? this.tourData.meetingPoint : 'Palermo Centro'),
                    language: leadLanguage,
                    country: leadCountry,
                    billingAddress: leadAddress ? `${leadAddress}, ${leadCity} ${leadZip}` : `${leadCountry}`,
                    notes: listaPartecipanti[0]?.notes || '',
                    participantsList: listaPartecipanti
                });
            }
        } catch (e) {
            console.error("Errore in Step3Dati.validaEProsegui:", e);
        }
    }
}
