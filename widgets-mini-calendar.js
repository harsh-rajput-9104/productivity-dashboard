// widgets-mini-calendar.js — compact, date-only calendar widget
(function () {
    'use strict';

    const elGrid = () => document.getElementById('mini-calendar-grid');
    const elMonth = () => document.getElementById('mini-calendar-month');
    const prevBtn = () => document.querySelector('.mini-cal-prev');
    const nextBtn = () => document.querySelector('.mini-cal-next');

    let current = new Date();
    current.setDate(1);

    function render() {
        const grid = elGrid();
        const monthLabel = elMonth();
        if (!grid || !monthLabel) return;

        // Clear
        grid.innerHTML = '';

        const year = current.getFullYear();
        const month = current.getMonth();

        // Month label
        monthLabel.textContent = current.toLocaleString(undefined, { month: 'long', year: 'numeric' });

        // Weekday headers
        const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        weekdays.forEach(d => {
            const w = document.createElement('div');
            w.className = 'mini-calendar-weekday';
            w.textContent = d;
            grid.appendChild(w);
        });

        // First day of month weekday (0-6)
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev = new Date(year, month, 0).getDate();

        // Leading days from previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = document.createElement('div');
            d.className = 'mini-calendar-day muted';
            d.textContent = (daysInPrev - i);
            grid.appendChild(d);
        }

        // Current month days
        const today = new Date();
        const todayISO = today.toISOString().split('T')[0];
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.className = 'mini-calendar-day';
            const cellDate = new Date(year, month, d);
            const cellISO = cellDate.toISOString().split('T')[0];
            cell.textContent = d;
            if (cellISO === todayISO) {
                cell.classList.add('today');
                cell.setAttribute('aria-current', 'date');
            } else if (cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                cell.classList.add('muted');
            }
            grid.appendChild(cell);
        }

        // Trailing days to complete grid (7 columns)
        const totalCells = grid.childElementCount;
        const remainder = totalCells % 7;
        if (remainder !== 0) {
            const toAdd = 7 - remainder;
            for (let i = 1; i <= toAdd; i++) {
                const td = document.createElement('div');
                td.className = 'mini-calendar-day muted';
                td.textContent = i;
                grid.appendChild(td);
            }
        }
    }

    function prevMonth() {
        current.setMonth(current.getMonth() - 1);
        render();
    }

    function nextMonth() {
        current.setMonth(current.getMonth() + 1);
        render();
    }

    function init() {
        document.addEventListener('DOMContentLoaded', () => {
            if (!elGrid()) return;
            render();
            const p = prevBtn();
            const n = nextBtn();
            if (p) p.addEventListener('click', prevMonth);
            if (n) n.addEventListener('click', nextMonth);
        });
    }

    init();
})();
