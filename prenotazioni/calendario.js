/**
 * Modulo Calendario Interattivo Avanzato - Sicily Palermo Tour
 * Gestisce la visualizzazione mensile, giorni di chiusura, e disponibilità slot dinamica per specifica data.
 */

class TourCalendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container Calendario "${containerId}" non trovato.`);
            return;
        }

        this.onDateChange = options.onDateChange || null;
        this.onSlotChange = options.onSlotChange || null;
        this.singleFixedDate = options.singleFixedDate || null;

        if (this.singleFixedDate) {
            const parts = this.singleFixedDate.split('-');
            if (parts.length === 3) {
                this.currentDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                this.selectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            } else {
                this.currentDate = new Date();
                this.selectedDate = new Date();
            }
        } else {
            this.currentDate = new Date();
            this.selectedDate = new Date();
        }
        this.selectedSlot = null;

        this.closedDays = options.closedDays || [];

        this.defaultSlots = options.defaultSlots || [
            { time: '09:30', maxCapacity: 15, booked: 0 },
            { time: '11:30', maxCapacity: 15, booked: 0 },
            { time: '15:30', maxCapacity: 15, booked: 0 },
            { time: '18:00', maxCapacity: 15, booked: 0 }
        ];

        this.weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        this.monthNames = [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ];

        this.init();
    }

    setSlots(newSlotsArray) {
        if (newSlotsArray && Array.isArray(newSlotsArray) && newSlotsArray.length > 0) {
            this.defaultSlots = newSlotsArray.map(s => {
                if (typeof s === 'string') {
                    return { time: s, maxCapacity: 15, booked: 0 };
                }
                return s;
            });
            const primoLibero = this.defaultSlots.find(s => (s.maxCapacity - s.booked) > 0);
            this.selectedSlot = primoLibero ? primoLibero.time : this.defaultSlots[0].time;
            this.render();
        }
    }

    init() {
        const primoLibero = this.defaultSlots.find(s => (s.maxCapacity - s.booked) > 0);
        this.selectedSlot = primoLibero ? primoLibero.time : (this.defaultSlots[0] ? this.defaultSlots[0].time : '09:30');

        this.render();
    }

    render() {
        if (!this.container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let startingDay = firstDayOfMonth.getDay() - 1;
        if (startingDay === -1) startingDay = 6;

        const totalDays = lastDayOfMonth.getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let html = `
            <div class="custom-calendar-widget">
                <!-- Header Mese e Navigazione -->
                <div class="calendar-header">
                    <button type="button" class="calendar-nav-btn" id="cal-prev-btn" title="Mese precedente">❮</button>
                    <h4>🗓️ ${this.monthNames[month]} ${year}</h4>
                    <button type="button" class="calendar-nav-btn" id="cal-next-btn" title="Mese successivo">❯</button>
                </div>

                <!-- Giorni Settimana -->
                <div class="calendar-weekdays">
                    ${this.weekDays.map(day => `<div>${day}</div>`).join('')}
                </div>

                <!-- Griglia Giorni Mese -->
                <div class="calendar-days-grid">
        `;

        for (let i = 0; i < startingDay; i++) {
            html += `<div class="day-cell empty-cell"></div>`;
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            dateObj.setHours(0, 0, 0, 0);

            const dateStr = this.formatDateISO(dateObj);
            const dayOfWeek = dateObj.getDay();

            let isDisabled = false;
            if (this.singleFixedDate) {
                isDisabled = (dateStr !== this.singleFixedDate);
            } else {
                const isPast = dateObj.getTime() < today.getTime();
                const isClosed = this.closedDays.includes(dayOfWeek);
                isDisabled = isPast || isClosed;
            }

            const isToday = dateObj.getTime() === today.getTime();
            const isSelected = this.selectedDate && dateObj.getTime() === this.selectedDate.getTime();

            let classes = ['day-cell'];
            if (isDisabled) classes.push('day-disabled');
            if (isToday) classes.push('day-today');
            if (isSelected) classes.push('day-selected');

            const dateStr = this.formatDateISO(dateObj);

            html += `
                <div class="${classes.join(' ')}"
                     data-date="${dateStr}"
                     ${isDisabled ? '' : `onclick="window.tourCalendarInstance.selectDate('${dateStr}')"`}>
                    <span>${day}</span>
                    ${!isDisabled ? '<span class="day-status-indicator status-dot-available"></span>' : ''}
                </div>
            `;
        }

        html += `
                </div>

                <!-- Sezione Slot Orari e Capienza Calcolata Dinamicamente per la Data Selezionata -->
                <div class="slots-container">
                    <div class="slots-title">
                        ⏰ Orari e Disponibilità Posti per <u>${this.formatDateReadable(this.selectedDate)}</u>:
                    </div>
                    <div class="slots-grid" id="cal-slots-grid">
                        ${this.renderSlotsHtml()}
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        const prevBtn = this.container.querySelector('#cal-prev-btn');
        const nextBtn = this.container.querySelector('#cal-next-btn');

        if (prevBtn) {
            const prevMonthDate = new Date(year, month - 1, 1);
            if (prevMonthDate.getFullYear() < today.getFullYear() ||
               (prevMonthDate.getFullYear() === today.getFullYear() && prevMonthDate.getMonth() < today.getMonth())) {
                prevBtn.disabled = true;
            } else {
                prevBtn.onclick = () => this.changeMonth(-1);
            }
        }

        if (nextBtn) {
            nextBtn.onclick = () => this.changeMonth(1);
        }

        window.tourCalendarInstance = this;
    }

    renderSlotsHtml() {
        const selectedDateISO = this.formatDateISO(this.selectedDate);
        const selectedDateReadable = this.formatDateReadable(this.selectedDate);

        let bookings = [];
        try {
            bookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]');
        } catch (e) {}

        return this.defaultSlots.map(slot => {
            const timeSlotStr = slot.time;
            const maxCap = parseInt(slot.maxCapacity, 10) || 15;

            // Calcola dinamicamente il totale dei passeggeri prenotati PER QUESTA SPECIFICA DATA ed ORARIO
            let realBookedForThisDateAndSlot = 0;

            if (Array.isArray(bookings)) {
                bookings.forEach(b => {
                    const matchDate = (b.dateISO === selectedDateISO) || (b.dateReadable === selectedDateReadable);
                    const matchTime = (b.time === timeSlotStr) || (b.slotTime === timeSlotStr);

                    if (matchDate && matchTime && b.status !== 'Cancellata' && b.status !== 'Rimborsata') {
                        const numPasseggeri = (b.participantsList && b.participantsList.length > 0)
                            ? b.participantsList.length
                            : ((parseInt(b.adults, 10) || 1) + (parseInt(b.children, 10) || 0));
                        realBookedForThisDateAndSlot += numPasseggeri;
                    }
                });
            }

            const postiRimanenti = Math.max(0, maxCap - realBookedForThisDateAndSlot);
            const percentualeOccupata = Math.min(100, Math.round((realBookedForThisDateAndSlot / maxCap) * 100));
            const isFull = postiRimanenti <= 0;
            const isSelected = this.selectedSlot === timeSlotStr;

            let slotClasses = ['slot-card'];
            if (isFull) slotClasses.push('slot-full');
            if (isSelected) slotClasses.push('selected');

            let fillClass = 'fill-success';
            if (percentualeOccupata > 80) fillClass = 'fill-danger';
            else if (percentualeOccupata > 50) fillClass = 'fill-warning';

            let statusText = `🟢 ${postiRimanenti} posti liberi`;
            if (isFull) statusText = '🔴 Esaurito';
            else if (postiRimanenti <= 3) statusText = `⚠️ Ultimi ${postiRimanenti} posti!`;

            return `
                <div class="${slotClasses.join(' ')}"
                     ${isFull ? '' : `onclick="window.tourCalendarInstance.selectSlot('${timeSlotStr}')"`}>
                    <div class="slot-time">${timeSlotStr}</div>
                    <div class="slot-status-badge">${statusText}</div>
                    <div class="capacity-progress-bg" title="${realBookedForThisDateAndSlot}/${maxCap} posti prenotati per il ${selectedDateReadable}">
                        <div class="capacity-progress-fill ${fillClass}" style="width: ${percentualeOccupata}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    selectDate(dateStr) {
        const parts = dateStr.split('-');
        this.selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        this.selectedDate.setHours(0, 0, 0, 0);

        const primoLibero = this.defaultSlots.find(s => (s.maxCapacity - s.booked) > 0);
        this.selectedSlot = primoLibero ? primoLibero.time : this.defaultSlots[0].time;

        this.render();

        if (typeof this.onDateChange === 'function') {
            this.onDateChange(this.formatDateISO(this.selectedDate), this.selectedDate);
        }
    }

    selectSlot(time) {
        this.selectedSlot = time;

        const slotsGrid = this.container.querySelector('#cal-slots-grid');
        if (slotsGrid) {
            slotsGrid.innerHTML = this.renderSlotsHtml();
        }

        if (typeof this.onSlotChange === 'function') {
            this.onSlotChange(time);
        }
    }

    formatDateISO(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    formatDateReadable(dateObj) {
        if (!dateObj) return 'Nessuna data';
        const d = dateObj.getDate();
        const m = this.monthNames[dateObj.getMonth()];
        const y = dateObj.getFullYear();
        return `${d} ${m} ${y}`;
    }

    getSelectedData() {
        return {
            dateISO: this.formatDateISO(this.selectedDate),
            dateReadable: this.formatDateReadable(this.selectedDate),
            slotTime: this.selectedSlot || '09:30'
        };
    }
}
