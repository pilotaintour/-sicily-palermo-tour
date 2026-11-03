/**
 * STEP 2: Selezione Partecipanti con Design Premium & Emojis
 */

class Step2Partecipanti {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onComplete = options.onComplete || null;
        this.onPrev = options.onPrev || null;

        this.numAdulti = 1;
        this.numBambini = 0;
        this.maxCap = 15;
        this.timeSlot = '09:30';

        this.init();
    }

    init() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="step-card-header">
                ✨ Step 2: Seleziona Partecipanti per il Tour
            </div>

            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 14px 18px; border-radius: 14px; border: 1px solid #bae6fd; margin-bottom: 22px; font-size: 0.9rem; color: #0369a1; font-weight: 600; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div>⏰ Orario Selezionato: <strong><span id="step2-slot-display">09:30</span></strong></div>
                <div>🎯 Capienza Max Slot: <strong><span id="step2-cap-display">15</span> persone</strong></div>
            </div>

            <!-- CARD ADULTI -->
            <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <span style="font-size: 2.2rem; background: #f1f5f9; padding: 10px; border-radius: 14px; display: flex; align-items: center; justify-content: center;">🧑</span>
                    <div>
                        <strong style="color: #0b2545; display: block; font-size: 1.15rem; font-weight: 800;">Adulti</strong>
                        <span style="font-size: 0.88rem; color: #64748b; font-weight: 600;">Età 13+ anni</span>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 14px;">
                    <button type="button" class="btn-nav-prev" style="width: 42px; height: 42px; border-radius: 12px; font-size: 1.3rem; padding: 0; display: flex; align-items: center; justify-content: center;" id="btn-adulti-minus">-</button>
                    <span id="step2-cnt-adulti" style="font-weight: 800; font-size: 1.4rem; color: #0b2545; width: 32px; text-align: center;">1</span>
                    <button type="button" class="btn-nav-prev" style="width: 42px; height: 42px; border-radius: 12px; font-size: 1.3rem; padding: 0; display: flex; align-items: center; justify-content: center;" id="btn-adulti-plus">+</button>
                </div>
            </div>

            <!-- CARD BAMBINI -->
            <div style="background: #fffbf5; border: 1.5px solid #fed7aa; border-radius: 16px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.04); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <span style="font-size: 2.2rem; background: #ffedd5; padding: 10px; border-radius: 14px; display: flex; align-items: center; justify-content: center;">🧒</span>
                    <div>
                        <strong style="color: #c2410c; display: block; font-size: 1.15rem; font-weight: 800;">Bambini</strong>
                        <span style="font-size: 0.88rem; color: #d97706; font-weight: 600;">Età 4-12 anni</span>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 14px;">
                    <button type="button" class="btn-nav-prev" style="width: 42px; height: 42px; border-radius: 12px; font-size: 1.3rem; padding: 0; display: flex; align-items: center; justify-content: center; border-color: #fed7aa;" id="btn-bambini-minus">-</button>
                    <span id="step2-cnt-bambini" style="font-weight: 800; font-size: 1.4rem; color: #c2410c; width: 32px; text-align: center;">0</span>
                    <button type="button" class="btn-nav-prev" style="width: 42px; height: 42px; border-radius: 12px; font-size: 1.3rem; padding: 0; display: flex; align-items: center; justify-content: center; border-color: #fed7aa;" id="btn-bambini-plus">+</button>
                </div>
            </div>

            <div class="step-nav-bar">
                <button type="button" class="btn-nav-prev" id="btn-step2-prev">
                    ← Indietro
                </button>
                <button type="button" class="btn-nav-next" id="btn-step2-next">
                    Avanti: I Tuoi Dati →
                </button>
            </div>
        `;

        this.container.querySelector('#btn-adulti-minus').onclick = () => this.modifica('adulti', -1);
        this.container.querySelector('#btn-adulti-plus').onclick = () => this.modifica('adulti', 1);
        this.container.querySelector('#btn-bambini-minus').onclick = () => this.modifica('bambini', -1);
        this.container.querySelector('#btn-bambini-plus').onclick = () => this.modifica('bambini', 1);

        this.container.querySelector('#btn-step2-prev').onclick = () => {
            if (typeof this.onPrev === 'function') this.onPrev();
        };

        this.container.querySelector('#btn-step2-next').onclick = () => this.validaEProsegui();
    }

    setSlotInfo(slotTime, maxCap) {
        this.timeSlot = slotTime || '09:30';
        this.maxCap = parseInt(maxCap, 10) || 15;

        const slotDisp = this.container.querySelector('#step2-slot-display');
        const capDisp = this.container.querySelector('#step2-cap-display');
        if (slotDisp) slotDisp.textContent = this.timeSlot;
        if (capDisp) capDisp.textContent = this.maxCap;
    }

    modifica(tipo, delta) {
        const totaleAttuale = this.numAdulti + this.numBambini;
        if (delta > 0 && (totaleAttuale + delta) > this.maxCap) {
            alert(`⚠️ Impossibile aggiungere altri partecipanti per l'orario delle ${this.timeSlot}. La capienza massima per questo slot è di ${this.maxCap} persone.`);
            return;
        }

        if (tipo === 'adulti') {
            this.numAdulti = Math.max(1, this.numAdulti + delta);
            const el = this.container.querySelector('#step2-cnt-adulti');
            if (el) el.textContent = this.numAdulti;
        } else if (tipo === 'bambini') {
            this.numBambini = Math.max(0, this.numBambini + delta);
            const el = this.container.querySelector('#step2-cnt-bambini');
            if (el) el.textContent = this.numBambini;
        }

        if (typeof aggiornaTraduzioneDinamica === 'function') {
            aggiornaTraduzioneDinamica();
        }
    }

    validaEProsegui() {
        if (typeof this.onComplete === 'function') {
            this.onComplete({
                adults: this.numAdulti,
                children: this.numBambini
            });
        }
    }

    getData() {
        return {
            adults: this.numAdulti,
            children: this.numBambini
        };
    }
}
