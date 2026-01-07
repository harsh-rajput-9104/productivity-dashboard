# 📦 Integration Guide: Quote & Calendar Widgets

This guide shows how to add two new widgets to your Productivity Dashboard.

## 🎯 Overview

### Widget A: Daily Quote / Motivation
- Compact motivational quote display with favorites system
- LocalStorage: `prodDash.quote.v1`, `prodDash.quote.favorites.v1`
- File: `widgets-quote.js`

### Widget B: (removed)
- The Calendar widget has been removed from this project.
    Previously included a mini calendar and event management.

---

## 📐 STEP 1: Update Dashboard Layout

### Current Structure
Your dashboard currently has:
```
<main class="app-main">
    <section class="column column-left">
        <!-- Todos, Notes -->
    </section>
    <section class="column column-right">
        <!-- Pomodoro Timer -->
    </section>
</main>
```

### New Structure (Recommended)
Change to a 3-column or 2+1 layout:

**Option A: Three Columns (Desktop)**
```html
<main class="app-main">
    <section class="column column-left">
        <!-- Todos, Notes -->
    </section>
    <section class="column column-middle">
        <!-- Pomodoro Timer, Quote Widget -->
    </section>
    <section class="column column-right">
        <!-- Calendar Widget -->
    </section>
</main>
```

**Option B: Two Columns + Widgets Below (Responsive)**
```html
<main class="app-main">
    <section class="column column-left">
        <!-- Todos, Notes -->
    </section>
    <section class="column column-right">
        <!-- Pomodoro Timer -->
    </section>
</main>

<!-- New widgets section below -->
<section class="app-widgets">
    <article class="pd-quote-widget">
        <!-- Quote Widget HTML -->
    </article>
    <article class="pd-calendar-widget">
        <!-- Calendar Widget HTML -->
    </article>
</section>
```

---

## 🔧 STEP 2: Add HTML to index.html

Add this **before the closing `</main>` tag** or after it:

### Quote Widget HTML
Insert this in your desired column:
```html
<!-- Daily Quote / Motivation Widget -->
<article class="pd-quote-widget card">
    <div class="card-header">
        <h2 class="section-title">💭 Daily Motivation</h2>
        <button class="pd-quote-favorites-btn" aria-label="View favorite quotes" title="View favorites">
            ⭐ <span class="pd-quote-favorites-count">0</span>
        </button>
    </div>

    <!-- Quote Display -->
    <div class="pd-quote-container" role="region" aria-live="polite" aria-label="Daily quote">
        <div class="pd-quote-text">Loading quote...</div>
        <div class="pd-quote-author">— Dashboard</div>
        <div class="pd-quote-timestamp" aria-label="Last updated">Last updated: now</div>
    </div>

    <!-- Quote Controls -->
    <div class="pd-quote-controls">
        <button class="btn btn-secondary btn-sm pd-quote-next-btn" aria-label="Show next quote">
            Next Quote
        </button>
        <button class="btn btn-secondary btn-sm pd-quote-copy-btn" aria-label="Copy quote to clipboard">
            📋 Copy
        </button>
        <button class="btn btn-secondary btn-sm pd-quote-favorite-btn" aria-label="Add quote to favorites">
            ☆ Save
        </button>
    </div>
</article>

<!-- Favorites Modal -->
<div id="pd-quote-favorites-modal" class="modal" role="dialog" aria-labelledby="pd-favorites-title" aria-hidden="true">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="pd-favorites-title" class="modal-title">⭐ Favorite Quotes</h3>
            <button class="modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
            <ul id="pd-favorites-list" class="pd-favorites-list" role="list">
                <!-- Favorites populated by JS -->
            </ul>
        </div>
    </div>
</div>
```

### Calendar Widget HTML
The Calendar widget has been removed from the project. No additional HTML is required.
            <div class="form-group">
                <label for="pd-edit-event-time">Time</label>
                <input id="pd-edit-event-time" type="time" class="input-field">
            </div>
            <div class="form-group">
                <label for="pd-edit-event-notes">Notes</label>
                <textarea id="pd-edit-event-notes" class="input-field textarea" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="pd-edit-event-remind">Remind me (minutes before)</label>
                <input id="pd-edit-event-remind" type="number" class="input-field" min="0" max="1440" placeholder="30">
            </div>
            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-danger modal-cancel" id="pd-delete-event-btn">Delete</button>
                <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
            </div>
        </form>
    </div>
</div>
```

---

## 🎨 STEP 3: Add CSS to style.css

Append this to the end of your `style.css` file:

**[See `widgets-styles.css` for full CSS code]**

---

## 📜 STEP 4: Add JavaScript Modules

Create two files or add to your `script.js`:

### Option A: Separate Files (Recommended)
1. Create `widgets-quote.js`
2. Create `widgets-mini-calendar.js` (compact, date-only calendar)
3. Add to `index.html` before `</body>`:
```html
<script src="widgets-quote.js" defer></script>
<script src="widgets-mini-calendar.js" defer></script>
```

### Option B: Inline in script.js
Paste the content of both widget modules at the end of `script.js`.

Then add initialization calls in your `UI.init()` function (if using the full quote widget):
```javascript
// In UI.init():
if (typeof pdQuoteInit === 'function') pdQuoteInit();
// The mini calendar auto-initializes itself when its DOM is present;
// no manual `pdCalendarInit()` call is required for the compact widget.
```

---

## 🚀 STEP 5: CSS Grid Layout Update

Update your `style.css` `.app-main` grid to support new layout:

**For 3-column desktop:**
```css
.app-main {
    grid-template-columns: 1fr 1fr 1fr; /* Changed from 1fr 1fr */
    gap: var(--spacing-xl);
}

@media (max-width: 1024px) {
    .app-main {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 768px) {
    .app-main {
        grid-template-columns: 1fr;
    }
}
```

**For 2-column + widgets section:**
```css
.app-widgets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-xl);
    max-width: var(--container-max-width);
    width: 100%;
    margin: 0 auto;
    padding: var(--container-padding);
}

@media (max-width: 768px) {
    .app-widgets {
        grid-template-columns: 1fr;
    }
}
```

---

## 🔌 Quick Integration Checklist

- [ ] Add widget HTML snippets to `index.html`
- [ ] Add CSS from `widgets-styles.css` to `style.css`
- [ ] Add JavaScript modules (`widgets-quote.js`, `widgets-mini-calendar.js`) or paste into `script.js`
- [ ] Update `.app-main` grid layout in CSS
- [ ] Add initialization calls in `UI.init()` function
- [ ] Test on mobile (360px), tablet (768px), and desktop (1024px+)
- [ ] Check LocalStorage keys in DevTools
- [ ] Test keyboard navigation (Tab, Arrow keys, Enter, Escape)
- [ ] Verify light/dark theme compatibility

---

## 🎯 API Keys (Optional)

Both widgets work WITHOUT external APIs using built-in sample data.

### Quote Widget - Optional API
To fetch quotes from an external API:
1. Sign up at https://api.quotable.io (free, no key needed)
2. Uncomment the fetch call in `pdQuoteInit()` function

---

## 📊 LocalStorage Keys Created

```javascript
prodDash.quote.v1              // Current quote object
prodDash.quote.favorites.v1    // Array of favorite quotes
prodDash.calendar.events.v1    // Array of calendar events
```

Check in DevTools: `F12 → Application → LocalStorage`

---

## 🎬 Demo Data

**Quote Widget:** Includes 10 sample quotes. Shows new quote every 24 hours.

**Calendar Widget:** Includes 2 sample events. Click any day to add events.

---

## 🚨 Troubleshooting

**Widgets not showing?**
- Check browser console for errors (`F12`)
- Ensure HTML is inside `.app-main` or separate `.app-widgets` section
- Verify script files are loaded (Network tab)

**Calendar days not clickable?**
- Check if `.pd-calendar-day` elements exist in DOM
- Verify JavaScript initialized without errors

**Theme toggle not affecting widgets?**
- Widgets use CSS variables that inherit from `:root`
- Toggle adds `dark-theme` class to `<body>` — widgets should update automatically

**LocalStorage full warning?**
- Clear unused storage or reduce event/quote history
- Use Export feature to backup and clear events

---

## ✨ Features Summary

### Quote Widget
✅ 10 built-in quotes + favorites system
✅ 24-hour quote rotation (caches quote)
✅ Copy to clipboard with fallback
✅ Toast notifications (aria-live)
✅ Favorites modal (keyboard accessible)
✅ Smooth animations (respects prefers-reduced-motion)

### Calendar Widget
✅ Month-view calendar (Sun-Sat by default)
✅ Event CRUD (create, read, update, delete)
✅ Upcoming events list
✅ Event reminders (every minute check, shows toast)
✅ JSON export/import for backup
✅ Keyboard navigation (arrow keys)
✅ Multi-day support, timezone-aware times
✅ Responsive grid (360px to desktop)

---

**Happy Productivity!** 🚀
