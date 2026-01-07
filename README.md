# 📊 Productivity Dashboard

A modern, responsive, single-page productivity application built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools—just pure, production-ready code.

## ✨ Features

### 1. **To-Do List** 📋
- **Add, edit, and delete tasks** with title, description, due date, and priority
- **Filter by status**: All / Active / Completed
- **Sort options**: Newest first, oldest first, priority, alphabetical
- **Bulk actions**: Clear completed tasks
- **Persistent storage**: All data saved to LocalStorage

### 2. **Pomodoro Timer** 🍅
- **Configurable durations**: Focus (default 25 min), short break (5 min), long break (15 min)
- **Visual progress ring** with smooth animations
- **Session counter** to track your productivity streaks
- **Sound notifications** (with toggle to mute) using WebAudio API
- **Auto-switching** between focus and break sessions
- **Settings panel** to customize all durations
- **Persistent state**: Timer settings saved to LocalStorage

### 3. **Sticky Notes** 📝
- **Quick note creation** with title and body content
- **Edit and delete** notes on the fly
- **Colorful gradient cards** with smooth hover effects
- **Responsive grid layout** that adapts to screen size
- **LocalStorage persistence**

### 4. **Theme Toggle** 🌙
- **Light/Dark theme** with smooth transitions
- **Persistent preference** saved to LocalStorage
- **High contrast support** for accessibility
- **Reduced motion support** for users who prefer it

## 📦 Installation & Setup

### Quick Start
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start being productive! 🚀

### Running Locally with a Server (Recommended)
For best results, serve the files from a local server:

**Using Python 3:**
```bash
python -m http.server 8000
```

**Using Node.js (http-server):**
```bash
npx http-server
```

**Using VS Code Live Server:**
- Install the "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

Then visit `http://localhost:8000` in your browser.

## 🎨 Design & Customization

### Color Scheme
Edit CSS variables in `style.css` (lines 6-27) to customize colors:

```css
:root {
    --bg: #f8f9fa;              /* Background color */
    --card: #ffffff;             /* Card background */
    --primary: #06b6d4;          /* Primary accent color */
    --accent: #7c3aed;           /* Secondary accent */
    --text: #1e293b;             /* Text color */
    /* ... more variables */
}
```

The dark theme automatically inverts these colors (see `body.dark-theme` in CSS).

### Responsive Breakpoints
- **Desktop**: 1024px and up (2-column layout)
- **Tablet**: 768px - 1023px (2-column layout)
- **Mobile**: 480px - 767px (1-column layout)
- **Small Mobile**: Under 480px (optimized for 360px width)

### Fonts
Uses Google Fonts "Poppins" with system font fallbacks. To change, edit the `@import` in `style.css` and update `--font-family`.

## 💾 LocalStorage Keys

All data is stored in your browser's LocalStorage under these namespaced keys:

| Key | Purpose | Data |
|-----|---------|------|
| `prodDash.todos.v1` | To-do list items | Array of task objects |
| `prodDash.notes.v1` | Sticky notes | Array of note objects |
| `prodDash.pomodoro.v1` | Pomodoro state | Current session info |
| `prodDash.pomodoroSettings.v1` | Pomodoro settings | Duration preferences |
| `prodDash.theme.v1` | Theme preference | "light" or "dark" |

**To clear all data** (useful for testing), run in your browser console:
```javascript
Object.keys(localStorage).forEach(k => k.includes('prodDash') && localStorage.removeItem(k));
location.reload();
```

## ♿ Accessibility Features

- **Semantic HTML5** elements (header, nav, main, article, section)
- **ARIA labels and roles** for screen readers
- **Keyboard navigation** fully supported (Tab, Enter, Space, Escape)
- **Focus visible outlines** for keyboard users
- **Color contrast** meets WCAG AA standards
- **Live regions** for dynamic updates (ARIA live)
- **Reduced motion** support via `@media (prefers-reduced-motion: reduce)`
- **High contrast mode** detection and support

## 🚀 Deployment

### GitHub Pages
1. Create a repository on GitHub
2. Push the three files to the `main` branch
3. Go to repository **Settings** → **Pages**
4. Set source to `main` branch and `/root` folder
5. Your site will be live at `https://username.github.io/repo-name`

### Vercel
1. Push code to GitHub
2. Import repository to [Vercel](https://vercel.com)
3. Vercel auto-detects static files
4. Deploy with one click

### Netlify
1. Drag and drop the folder to [Netlify](https://netlify.com)
2. Or connect your GitHub repo for auto-deploys

## 🛠️ Code Architecture

### JavaScript Modular Structure
The app uses a namespace pattern to avoid global pollution:

```javascript
window.ProdDash = {
    // Utilities
    StorageManager,    // LocalStorage wrapper
    debounce(),        // Debounce function
    throttle(),        // Throttle function
    showToast(),       // Notifications
    
    // Managers (self-contained modules)
    TodoManager,       // Task management
    PomodoroManager,   // Timer logic
    NotesManager,      // Notes management
    WeatherManager,    // Weather fetching
    ThemeManager,      // Theme toggle
    UI                 // UI initialization
}
```

Each manager has clear methods and handles its own storage, rendering, and events.

### CSS Organization
- **Reset & Variables** (~50 lines)
- **Layout & Structure** (~100 lines)
- **Components** (~400 lines)
  - Cards, buttons, forms, lists
  - Modals, toasts, collapsibles
- **Responsive** (~100 lines)
  - Media queries for tablet, mobile, small devices
- **Utilities** (~50 lines)
  - Animations, print styles, accessibility

## 🔒 Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14+)
- **IE 11**: Not supported (uses modern CSS variables, ES6+)

## 📝 Notes for Developers

### Adding a New Feature
1. Create a new manager object (e.g., `CalendarManager`)
2. Implement methods: `init()`, `render()`, `save()`
3. Add UI elements to `index.html`
4. Style in `style.css`
5. Call init from `UI.init()` in `script.js`

### Performance Optimizations
- Debounced resize handler (150ms)
- 10-minute weather cache
- Efficient DOM queries with caching
- CSS animations use `transform` and `opacity` (GPU-accelerated)
- Lazy-loaded fonts with `font-display: swap`

### Security Notes
- All data is local—no server communication except weather API
- HTML content is escaped to prevent XSS
- No eval() or dynamic script loading
- Safe use of `innerHTML` with escaped user input

## 🐛 Troubleshooting

**Data not persisting**
- Check if LocalStorage is enabled in your browser
- Make sure you're not in private/incognito mode
- Browser storage might be full—clear some space

**Pomodoro sound not working**
- Check if notifications are unmuted in browser settings
- Try a different browser (WebAudio support varies)
- Some browsers require user gesture before playing audio

**Responsive layout looks broken on mobile**
- Ensure viewport meta tag is in the HTML (it is by default)
- Try disabling zoom on your mobile browser
- Clear browser cache and reload

## 📄 License

This project is free to use, modify, and distribute. No attribution required.

## 🎯 Future Enhancement Ideas

- [ ] Task recurrence (daily, weekly, monthly)
- [ ] Time-tracking stats and analytics
- [ ] Task subtasks and checklists
- [ ] Note categories and tags
- [ ] Export to PDF or CSV
- [ ] Sync across devices (cloud sync)
- [ ] Collaborative features
- [ ] Calendar view for tasks
- [ ] Notifications via browser notifications API
- [ ] Keyboard shortcuts panel

---

**Built with ❤️ using vanilla web technologies. Happy productivity!** ⚡
