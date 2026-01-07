/* ========================================
   Productivity Dashboard - JavaScript
   ======================================== */

'use strict';

// ========================================
// NAMESPACE & UTILITIES
// ========================================

window.ProdDash = window.ProdDash || {};

/* LocalStorage Wrapper with error handling */
const StorageManager = {
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded');
                showToast('Storage full. Some data may not be saved.', 'warning');
            }
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }
};

/* Utility: Debounce function */
const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/* Utility: Throttle function */
const throttle = (func, delay = 300) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
};

/* Utility: Date formatting */
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/* Utility: Time formatting MM:SS */
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/* Utility: Unique ID generator */
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/* Utility: Toast notifications */
const showToast = (message, type = 'info', duration = 3000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `
        <span>${icons[type] || ''} ${message}</span>
        <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const removeToast = () => {
        toast.remove();
        clearTimeout(toastTimeout);
    };

    closeBtn.addEventListener('click', removeToast);
    const toastTimeout = setTimeout(removeToast, duration);
};

/* Utility: ARIA announcements */
const announce = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
};

/* Utility: Modal control */
const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }
};

// ========================================
// TO-DO LIST MANAGER
// ========================================

const TodoManager = {
    storageKey: 'prodDash.todos.v1',
    currentFilter: 'all',
    currentSort: 'date-desc',
    editingId: null,

    getTodos() {
        const stored = StorageManager.get(this.storageKey, []);
        return Array.isArray(stored) ? stored : [];
    },

    saveTodos(todos) {
        StorageManager.set(this.storageKey, todos);
    },

    addTodo(title, description = '', dueDate = '', priority = 'low') {
        const todos = this.getTodos();
        const todo = {
            id: generateId(),
            title,
            description,
            dueDate,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.push(todo);
        this.saveTodos(todos);
        return todo;
    },

    updateTodo(id, updates) {
        const todos = this.getTodos();
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = { ...todos[index], ...updates };
            this.saveTodos(todos);
            return todos[index];
        }
        return null;
    },

    deleteTodo(id) {
        const todos = this.getTodos();
        const filtered = todos.filter(t => t.id !== id);
        this.saveTodos(filtered);
    },

    toggleTodo(id) {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos(todos);
            return todo;
        }
    },

    getFilteredTodos() {
        let todos = this.getTodos();

        // Filter
        if (this.currentFilter === 'active') {
            todos = todos.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            todos = todos.filter(t => t.completed);
        }

        // Sort
        switch (this.currentSort) {
            case 'date-asc':
                todos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'title':
                todos.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'date-desc':
            default:
                todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return todos;
    },

    clearCompleted() {
        const todos = this.getTodos().filter(t => !t.completed);
        this.saveTodos(todos);
    },

    renderTodos() {
        const list = document.getElementById('todo-list');
        if (!list) return;

        const todos = this.getFilteredTodos();
        list.innerHTML = '';

        if (todos.length === 0) {
            list.innerHTML = `
                <li style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    No tasks to show
                </li>
            `;
            return;
        }

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', todo.id);

            const dateStr = todo.dueDate ? `📅 ${formatDate(todo.dueDate)}` : '';
            const priorityColor = todo.priority === 'high' ? '#ef4444' : todo.priority === 'medium' ? '#f59e0b' : '#10b981';

            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    aria-label="Toggle task complete"
                >
                <div class="todo-content">
                    <div class="todo-header">
                        <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                        <div class="todo-actions">
                            <button class="todo-btn edit-btn" title="Edit task" aria-label="Edit task">✏️</button>
                            <button class="todo-btn delete-btn" title="Delete task" aria-label="Delete task">🗑️</button>
                        </div>
                    </div>
                    ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                    <div class="todo-meta">
                        ${dateStr}
                        <span class="todo-priority ${todo.priority}">${todo.priority.toUpperCase()}</span>
                    </div>
                </div>
            `;

            // Checkbox handler
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                this.toggleTodo(todo.id);
                li.classList.toggle('completed');
                announce(`Task marked ${this.toggleTodo(todo.id).completed ? 'complete' : 'incomplete'}`);
            });

            // Edit button
            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                this.openEditModal(todo);
            });

            // Delete button
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('Delete this task?')) {
                    this.deleteTodo(todo.id);
                    this.renderTodos();
                    showToast('Task deleted', 'info');
                }
            });

            list.appendChild(li);
        });
    },

    openEditModal(todo) {
        this.editingId = todo.id;
        document.getElementById('edit-task-title-input').value = todo.title;
        document.getElementById('edit-task-description-input').value = todo.description;
        document.getElementById('edit-task-date-input').value = todo.dueDate;
        document.getElementById('edit-task-priority-input').value = todo.priority;
        Modal.open('edit-task-modal');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ========================================
// POMODORO TIMER MANAGER
// ========================================

const PomodoroManager = {
    storageKey: 'prodDash.pomodoro.v1',
    settingsKey: 'prodDash.pomodoroSettings.v1',

    isRunning: false,
    timeRemaining: 0,
    sessionType: 'focus', // 'focus', 'shortBreak', 'longBreak'
    sessionCount: 1,
    currentSessionNumber: 1,
    timerInterval: null,
    soundEnabled: true,

    defaults: {
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLong: 4
    },

    init() {
        const settings = StorageManager.get(this.settingsKey, this.defaults);
        Object.assign(this.defaults, settings);

        // Load UI values
        document.getElementById('focus-duration').value = this.defaults.focusDuration;
        document.getElementById('short-break-duration').value = this.defaults.shortBreakDuration;
        document.getElementById('long-break-duration').value = this.defaults.longBreakDuration;
        document.getElementById('sessions-before-long').value = this.defaults.sessionsBeforeLong;

        const saved = StorageManager.get(this.storageKey);
        if (saved) {
            this.sessionType = saved.sessionType || 'focus';
            this.sessionCount = saved.sessionCount || 1;
            this.currentSessionNumber = saved.currentSessionNumber || 1;
        }

        document.getElementById('sound-toggle').checked = this.soundEnabled;

        this.resetTimer();
        this.render();
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('pomodoro-start-btn').addEventListener('click', () => this.start());
        document.getElementById('pomodoro-pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('pomodoro-reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('settings-save-btn').addEventListener('click', () => this.saveSettings());
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
    },

    getDuration(type) {
        const durations = {
            focus: this.defaults.focusDuration,
            shortBreak: this.defaults.shortBreakDuration,
            longBreak: this.defaults.longBreakDuration
        };
        return durations[type] * 60; // Convert to seconds
    },

    resetTimer() {
        this.timeRemaining = this.getDuration(this.sessionType);
    },

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        document.getElementById('pomodoro-start-btn').disabled = true;
        document.getElementById('pomodoro-pause-btn').disabled = false;

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                this.onSessionComplete();
            }

            this.render();
            this.updateProgressRing();
        }, 1000);

        announce(`Timer started for ${this.sessionType}`);
    },

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;

        clearInterval(this.timerInterval);

        document.getElementById('pomodoro-start-btn').disabled = false;
        document.getElementById('pomodoro-pause-btn').disabled = true;

        announce('Timer paused');
    },

    reset() {
        this.isRunning = false;
        clearInterval(this.timerInterval);

        this.sessionType = 'focus';
        this.currentSessionNumber = 1;
        this.resetTimer();

        document.getElementById('pomodoro-start-btn').disabled = false;
        document.getElementById('pomodoro-pause-btn').disabled = true;

        this.render();
        this.updateProgressRing();
        announce('Timer reset');
    },

    onSessionComplete() {
        clearInterval(this.timerInterval);
        this.isRunning = false;

        this.playSound();

        if (this.sessionType === 'focus') {
            showToast('Focus session complete! Time for a break.', 'success');
            announce('Focus session complete! Time for a break');

            // Determine break type
            if (this.currentSessionNumber % this.defaults.sessionsBeforeLong === 0) {
                this.sessionType = 'longBreak';
            } else {
                this.sessionType = 'shortBreak';
            }
        } else {
            showToast('Break complete! Ready for another focus session?', 'success');
            announce('Break complete!');
            this.sessionType = 'focus';
            this.currentSessionNumber++;
        }

        this.resetTimer();
        this.sessionCount++;
        this.save();
        this.render();

        // Auto-start next session (optional)
        // this.start();

        document.getElementById('pomodoro-start-btn').disabled = false;
        document.getElementById('pomodoro-pause-btn').disabled = true;
    },

    playSound() {
        if (!this.soundEnabled) return;

        try {
            // Using WebAudio API for a simple beep
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('WebAudio not available, skipping sound');
        }
    },

    saveSettings() {
        this.defaults.focusDuration = parseInt(document.getElementById('focus-duration').value);
        this.defaults.shortBreakDuration = parseInt(document.getElementById('short-break-duration').value);
        this.defaults.longBreakDuration = parseInt(document.getElementById('long-break-duration').value);
        this.defaults.sessionsBeforeLong = parseInt(document.getElementById('sessions-before-long').value);

        StorageManager.set(this.settingsKey, this.defaults);
        this.resetTimer();
        this.render();
        showToast('Settings saved', 'success');
        announce('Settings saved');
    },

    save() {
        StorageManager.set(this.storageKey, {
            sessionType: this.sessionType,
            sessionCount: this.sessionCount,
            currentSessionNumber: this.currentSessionNumber
        });
    },

    render() {
        document.getElementById('timer-display').textContent = formatTime(this.timeRemaining);
        document.getElementById('session-info').textContent = this.getSessionLabel();
        document.getElementById('session-count').textContent = `Session: ${this.currentSessionNumber}`;
        this.updateProgressRing();
    },

    updateProgressRing() {
        const circle = document.querySelector('.progress-ring-circle');
        if (!circle) return;

        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const totalSeconds = this.getDuration(this.sessionType);
        const progress = this.timeRemaining / totalSeconds;
        const offset = circumference * (1 - progress);

        circle.style.strokeDashoffset = offset;
    },

    getSessionLabel() {
        const labels = {
            focus: '🎯 Focus',
            shortBreak: '☕ Short Break',
            longBreak: '🏖️ Long Break'
        };
        return labels[this.sessionType] || 'Timer';
    }
};

// ========================================
// STICKY NOTES MANAGER
// ========================================

const NotesManager = {
    storageKey: 'prodDash.notes.v1',
    editingId: null,

    getNotes() {
        const stored = StorageManager.get(this.storageKey, []);
        return Array.isArray(stored) ? stored : [];
    },

    saveNotes(notes) {
        StorageManager.set(this.storageKey, notes);
    },

    addNote(title, body) {
        const notes = this.getNotes();
        const note = {
            id: generateId(),
            title,
            body,
            createdAt: new Date().toISOString(),
            order: notes.length
        };
        notes.push(note);
        this.saveNotes(notes);
        return note;
    },

    updateNote(id, updates) {
        const notes = this.getNotes();
        const index = notes.findIndex(n => n.id === id);
        if (index !== -1) {
            notes[index] = { ...notes[index], ...updates };
            this.saveNotes(notes);
            return notes[index];
        }
    },

    deleteNote(id) {
        const notes = this.getNotes().filter(n => n.id !== id);
        this.saveNotes(notes);
    },

    renderNotes() {
        const container = document.getElementById('notes-container');
        if (!container) return;

        const notes = this.getNotes();
        container.innerHTML = '';

        if (notes.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">
                    No notes yet. Create your first note!
                </div>
            `;
            return;
        }

        notes.forEach(note => {
            const card = document.createElement('article');
            card.className = 'note-card';
            card.setAttribute('data-id', note.id);
            card.setAttribute('role', 'article');
            card.setAttribute('aria-label', `Note: ${note.title}`);

            card.innerHTML = `
                <h3 class="note-title">${NotesManager.escapeHtml(note.title)}</h3>
                <p class="note-body">${NotesManager.escapeHtml(note.body)}</p>
                <div class="note-actions">
                    <button class="note-btn edit-note-btn" title="Edit note" aria-label="Edit note">✏️</button>
                    <button class="note-btn delete-note-btn" title="Delete note" aria-label="Delete note">🗑️</button>
                </div>
            `;

            const editBtn = card.querySelector('.edit-note-btn');
            editBtn.addEventListener('click', () => this.openEditModal(note));

            const deleteBtn = card.querySelector('.delete-note-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('Delete this note?')) {
                    this.deleteNote(note.id);
                    this.renderNotes();
                    showToast('Note deleted', 'info');
                }
            });

            container.appendChild(card);
        });
    },

    openEditModal(note) {
        this.editingId = note.id;
        document.getElementById('note-title-input').value = note.title;
        document.getElementById('note-body-input').value = note.body;
        Modal.open('note-modal');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};


// ========================================
// THEME TOGGLE
// ========================================

const ThemeManager = {
    storageKey: 'prodDash.theme.v1',

    init() {
        const saved = StorageManager.get(this.storageKey, 'light');
        if (saved === 'dark') {
            document.body.classList.add('dark-theme');
        }

        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggle());
        }
    },

    toggle() {
        const isDark = document.body.classList.toggle('dark-theme');
        StorageManager.set(this.storageKey, isDark ? 'dark' : 'light');
        announce(`Theme changed to ${isDark ? 'dark' : 'light'} mode`);
    }
};

// ========================================
// UI INITIALIZATION
// ========================================

const UI = {
    init() {
        // Initialize sample data if storage is empty
        this.initSampleData();

        // Theme
        ThemeManager.init();

        // Todo
        TodoManager.renderTodos();

        const todoAddBtn = document.getElementById('todo-add-btn');
        if (todoAddBtn) {
            todoAddBtn.addEventListener('click', () => {
                Modal.open('edit-task-modal');
                TodoManager.editingId = null;
                document.getElementById('edit-task-form').reset();
            });
        }

        // Todo filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn-active'));
                e.target.classList.add('filter-btn-active');
                TodoManager.currentFilter = e.target.dataset.filter;
                TodoManager.renderTodos();
            });
        });

        // Todo sort
        const sortSelect = document.getElementById('todo-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                TodoManager.currentSort = e.target.value;
                TodoManager.renderTodos();
            });
        }

        // Clear completed
        const clearBtn = document.getElementById('todo-clear-completed-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all completed tasks?')) {
                    TodoManager.clearCompleted();
                    TodoManager.renderTodos();
                    showToast('Completed tasks cleared', 'info');
                }
            });
        }

        // Edit task modal
        const editForm = document.getElementById('edit-task-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('edit-task-title-input').value.trim();
                if (!title) return;

                if (TodoManager.editingId) {
                    TodoManager.updateTodo(TodoManager.editingId, {
                        title,
                        description: document.getElementById('edit-task-description-input').value,
                        dueDate: document.getElementById('edit-task-date-input').value,
                        priority: document.getElementById('edit-task-priority-input').value
                    });
                } else {
                    TodoManager.addTodo(
                        title,
                        document.getElementById('edit-task-description-input').value,
                        document.getElementById('edit-task-date-input').value,
                        document.getElementById('edit-task-priority-input').value
                    );
                }

                TodoManager.renderTodos();
                Modal.close('edit-task-modal');
                showToast(TodoManager.editingId ? 'Task updated' : 'Task added', 'success');
                announce(TodoManager.editingId ? 'Task updated' : 'Task added');
                TodoManager.editingId = null;
            });
        }

        // Notes
        NotesManager.renderNotes();

        const notesAddBtn = document.getElementById('notes-add-btn');
        if (notesAddBtn) {
            notesAddBtn.addEventListener('click', () => {
                Modal.open('note-modal');
                NotesManager.editingId = null;
                document.getElementById('note-form').reset();
            });
        }

        const noteForm = document.getElementById('note-form');
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('note-title-input').value.trim();
                const body = document.getElementById('note-body-input').value.trim();
                if (!title) return;

                if (NotesManager.editingId) {
                    NotesManager.updateNote(NotesManager.editingId, { title, body });
                } else {
                    NotesManager.addNote(title, body);
                }

                NotesManager.renderNotes();
                Modal.close('note-modal');
                showToast(NotesManager.editingId ? 'Note updated' : 'Note created', 'success');
                NotesManager.editingId = null;
            });
        }

        // Pomodoro
        PomodoroManager.init();

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    Modal.close(modal.id);
                }
            });
        });

        document.querySelectorAll('.modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    Modal.close(modal.id);
                }
            });
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    Modal.close(modal.id);
                }
            });
        });

        // Debounced window resize
        window.addEventListener('resize', debounce(() => {
            PomodoroManager.updateProgressRing();
        }, 150));

        announce('Productivity Dashboard loaded');
    },

    initSampleData() {
        // Only add sample data if storage is empty
        if (StorageManager.get(TodoManager.storageKey) === null) {
            TodoManager.addTodo(
                'Welcome to Productivity Dashboard!',
                'Check out the features: manage tasks, use the Pomodoro timer, create sticky notes.',
                '',
                'high'
            );
            TodoManager.addTodo(
                'Complete first Pomodoro session',
                'Try the Pomodoro timer on the right - 25 minutes focused work.',
                '',
                'medium'
            );
        }

        if (StorageManager.get(NotesManager.storageKey) === null) {
            NotesManager.addNote('Welcome!', 'Create sticky notes for quick ideas and reminders.');
        }
    }
};

// ========================================
// START APPLICATION
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UI.init());
} else {
    UI.init();
}
