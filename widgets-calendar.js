/* widgets-calendar.js removed: full calendar implementation deprecated.
   Replaced by a compact, date-only `widgets-mini-calendar.js`.
   This file kept as a tiny placeholder for historical reference.
*/

/* Placeholder: no runtime code to avoid re-introducing calendar functionality.
   If you want the full calendar back, restore from version control history.
*/

/**
 * Open edit modal
 */
function pdCalendarOpenEditModal(event) {
    pdCalendar.editingId = event.id;
    
    document.getElementById('pd-edit-event-title').value = event.title;
    document.getElementById('pd-edit-event-time').value = event.time || '';
    document.getElementById('pd-edit-event-notes').value = event.notes || '';
    document.getElementById('pd-edit-event-remind').value = event.remindMinutes || '';
    
    Modal.open('pd-event-modal');
    document.getElementById('pd-edit-event-title').focus();
}

/**
 * Save event edits
 */
function pdCalendarSaveEvent(e) {
    e.preventDefault();
    
    const event = pdCalendar.events.find(ev => ev.id === pdCalendar.editingId);
    if (!event) return;
    
    event.title = document.getElementById('pd-edit-event-title').value.trim();
    event.time = document.getElementById('pd-edit-event-time').value;
    event.notes = document.getElementById('pd-edit-event-notes').value.trim();
    event.remindMinutes = parseInt(document.getElementById('pd-edit-event-remind').value) || null;
    
    StorageManager.set(pdCalendar.storageKey, pdCalendar.events);
    Modal.close('pd-event-modal');
    pdCalendarRender();
    
    showToast('✓ Event updated!', 'success');
    announce('Event updated: ' + event.title);
}

/**
 * Delete event
 */
function pdCalendarDeleteEvent(id) {
    const eventId = typeof id === 'string' ? id : pdCalendar.editingId;
    pdCalendar.events = pdCalendar.events.filter(e => e.id !== eventId);
    StorageManager.set(pdCalendar.storageKey, pdCalendar.events);
    Modal.close('pd-event-modal');
    pdCalendarRender();
    showToast('🗑️ Event deleted', 'info');
}

/**
 * Navigate to previous month
 */
function pdCalendarPrevMonth() {
    pdCalendar.currentMonth.setMonth(pdCalendar.currentMonth.getMonth() - 1);
    pdCalendarRenderGrid();
}

/**
 * Navigate to next month
 */
function pdCalendarNextMonth() {
    pdCalendar.currentMonth.setMonth(pdCalendar.currentMonth.getMonth() + 1);
    pdCalendarRenderGrid();
}

/**
 * Jump to today
 */
function pdCalendarToday() {
    pdCalendar.currentMonth = new Date();
    pdCalendarSelectDate(new Date());
}

/**
 * Render upcoming events
 */
function pdCalendarRenderUpcoming() {
    const upcomingList = document.getElementById('pd-calendar-upcoming-list');
    if (!upcomingList) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = pdCalendar.events
        .filter(e => new Date(e.dateISO) >= today)
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO) || (a.time || '').localeCompare(b.time || ''))
        .slice(0, 3);
    
    upcomingList.innerHTML = '';
    
    if (upcoming.length === 0) {
        upcomingList.innerHTML = '<li class="pd-calendar-no-events">No upcoming events</li>';
        return;
    }
    
    upcoming.forEach(event => {
        const li = document.createElement('li');
        li.className = 'pd-calendar-upcoming-item';
        li.setAttribute('role', 'listitem');
        
        const eventDate = new Date(event.dateISO);
        const formatted = eventDate.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
        });
        
        li.innerHTML = `
            <div class="pd-calendar-upcoming-item-date">${formatted}</div>
            <div class="pd-calendar-upcoming-item-title">${pdCalendarEscapeHtml(event.title)}</div>
        `;
        
        upcomingList.appendChild(li);
    });
}

/**
 * Escape HTML
 */
function pdCalendarEscapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Start reminder check interval
 */
function pdCalendarStartReminderCheck() {
    pdCalendarStopReminderCheck();
    pdCalendar.reminderCheckInterval = setInterval(pdCalendarCheckReminders, 60000); // Every minute
    // Initial check
    pdCalendarCheckReminders();
}

/**
 * Stop reminder check interval
 */
function pdCalendarStopReminderCheck() {
    if (pdCalendar.reminderCheckInterval) {
        clearInterval(pdCalendar.reminderCheckInterval);
        pdCalendar.reminderCheckInterval = null;
    }
}

/**
 * Check for reminders to trigger
 */
function pdCalendarCheckReminders() {
    if (!pdCalendar.reminderCheckActive) return;
    
    const now = new Date();
    const reminders = StorageManager.get('prodDash.calendar.reminders.v1', {});
    
    pdCalendar.events.forEach(event => {
        if (event.remindMinutes === null || event.remindMinutes === undefined) return;
        
        const eventDateTime = new Date(event.dateISO + 'T' + (event.time || '00:00'));
        const remindTime = new Date(eventDateTime.getTime() - event.remindMinutes * 60000);
        
        const reminderId = event.id;
        const lastReminded = reminders[reminderId];
        const timeSinceRemind = lastReminded ? now - new Date(lastReminded) : Infinity;
        
        // Trigger reminder if within 1 minute window and not already reminded in last 2 minutes
        if (now >= remindTime && now < new Date(remindTime.getTime() + 60000) && timeSinceRemind > 120000) {
            showToast(`⏰ Reminder: ${event.title}`, 'info', 5000);
            announce('Reminder: ' + event.title);
            
            reminders[reminderId] = new Date().toISOString();
            StorageManager.set('prodDash.calendar.reminders.v1', reminders);
        }
    });
}

/**
 * Export events as JSON
 */
function pdCalendarExportEvents() {
    try {
        const json = JSON.stringify(pdCalendar.events, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'calendar-events-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✓ Events exported!', 'success');
    } catch (e) {
        showToast('Error exporting events', 'error');
    }
}

/**
 * Import events from JSON
 */
function pdCalendarImportEvents() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                
                if (!Array.isArray(imported)) {
                    showToast('Invalid file format', 'error');
                    return;
                }
                
                if (confirm('Merge with existing events or replace all?\\n\\nOK = Merge, Cancel = Replace')) {
                    pdCalendar.events = [...pdCalendar.events, ...imported];
                } else {
                    pdCalendar.events = imported;
                }
                
                StorageManager.set(pdCalendar.storageKey, pdCalendar.events);
                pdCalendarRender();
                showToast('✓ Events imported!', 'success');
            } catch (err) {
                showToast('Error reading file', 'error');
            }
        };
        reader.readAsText(file);
    });
    
    input.click();
}

/**
 * Clear all events
 */
function pdCalendarClearAll() {
    if (!confirm('Delete ALL events? This cannot be undone.')) return;
    
    pdCalendar.events = [];
    StorageManager.set(pdCalendar.storageKey, pdCalendar.events);
    pdCalendarRender();
    showToast('🗑️ All events cleared', 'info');
    announce('All events cleared');
}

/**
 * Initialize on DOM ready
 */
if (typeof StorageManager === 'undefined') {
    console.warn('StorageManager not found. Calendar widget requires main script.js.');
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', pdCalendarInit);
    } else {
        pdCalendarInit();
    }
}
