/* ========================================
   Quote Widget Module
   pdQuoteInit() - Initialize quote widget
   ======================================== */

'use strict';

// Quote Widget State
const pdQuote = {
    storageKey: 'prodDash.quote.v1',
    favoritesKey: 'prodDash.quote.favorites.v1',
    currentQuote: null,
    currentIndex: 0,
    quotes: [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
        { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
        { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
        { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
        { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
        { text: "What we think, we become.", author: "Buddha" },
        { text: "Act as if what you do makes a difference. It does.", author: "William James" },
        { text: "Your time is limited, so don’t waste it living someone else’s life.", author: "Steve Jobs" },
        { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
        { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair" },
        { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
        { text: "Small progress is still progress.", author: "Anonymous" },
        { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
        { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
        { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
        { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
        { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
        { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
        { text: "Consistency is what transforms average into excellence.", author: "Anonymous" },
        { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
        { text: "Work hard in silence, let success make the noise.", author: "Anonymous" }
    ],
    favorites: [],
    isFetching: false
};

/**
 * Initialize Quote Widget
 */
function pdQuoteInit() {
    // Load stored data
    pdQuote.favorites = StorageManager.get(pdQuote.favoritesKey, []);
    
    // Try to load cached quote
    const cached = StorageManager.get(pdQuote.storageKey);
    if (cached && pdQuote.isQuoteFresh(cached.timestamp)) {
        pdQuote.currentQuote = cached;
        pdQuoteRender();
    } else {
        // Show new random quote
        pdQuoteRotate();
    }
    
    // Bind event listeners
    pdQuoteBindEvents();
    
    // Update favorites count
    pdQuoteUpdateFavoritesCount();
}

/**
 * Check if quote is still fresh (< 24 hours old)
 */
pdQuote.isQuoteFresh = (timestamp) => {
    if (!timestamp) return false;
    const now = Date.now();
    const age = now - timestamp;
    return age < (24 * 60 * 60 * 1000); // 24 hours in milliseconds
};

/**
 * Bind event listeners
 */
function pdQuoteBindEvents() {
    const nextBtn = document.querySelector('.pd-quote-next-btn');
    const copyBtn = document.querySelector('.pd-quote-copy-btn');
    const favoriteBtn = document.querySelector('.pd-quote-favorite-btn');
    const favoritesBtn = document.querySelector('.pd-quote-favorites-btn');
    const modal = document.getElementById('pd-quote-favorites-modal');
    const modalClose = modal?.querySelector('.modal-close');
    
    if (nextBtn) nextBtn.addEventListener('click', pdQuoteRotate);
    if (copyBtn) copyBtn.addEventListener('click', pdQuoteCopy);
    if (favoriteBtn) favoriteBtn.addEventListener('click', pdQuoteToggleFavorite);
    if (favoritesBtn) favoritesBtn.addEventListener('click', pdQuoteOpenFavoritesModal);
    if (modalClose) modalClose.addEventListener('click', () => Modal.close('pd-quote-favorites-modal'));
    
    // Close modal on background click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) Modal.close('pd-quote-favorites-modal');
        });
    }
    
    // Keyboard escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') Modal.close('pd-quote-favorites-modal');
    });
}

/**
 * Rotate to next quote
 */
function pdQuoteRotate() {
    pdQuote.currentIndex = (pdQuote.currentIndex + 1) % pdQuote.quotes.length;
    pdQuote.currentQuote = {
        ...pdQuote.quotes[pdQuote.currentIndex],
        timestamp: Date.now()
    };
    StorageManager.set(pdQuote.storageKey, pdQuote.currentQuote);
    pdQuoteRender();
    announce('New quote: ' + pdQuote.currentQuote.text);
}

/**
 * Render quote to DOM
 */
function pdQuoteRender() {
    if (!pdQuote.currentQuote) return;
    
    const textEl = document.querySelector('.pd-quote-text');
    const authorEl = document.querySelector('.pd-quote-author');
    const timestampEl = document.querySelector('.pd-quote-timestamp');
    const favoriteBtn = document.querySelector('.pd-quote-favorite-btn');
    
    if (textEl) textEl.textContent = pdQuote.currentQuote.text;
    if (authorEl) authorEl.textContent = '— ' + pdQuote.currentQuote.author;
    
    if (timestampEl) {
        const time = new Date(pdQuote.currentQuote.timestamp);
        const formatted = pdQuoteFormatTime(time);
        timestampEl.textContent = 'Last updated: ' + formatted;
        timestampEl.setAttribute('aria-label', 'Last updated: ' + formatted);
    }
    
    // Update favorite button state
    if (favoriteBtn) {
        const isFav = pdQuoteIsFavorite(pdQuote.currentQuote);
        favoriteBtn.textContent = isFav ? '★ Saved' : '☆ Save';
        favoriteBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    }
}

/**
 * Format time for display
 */
function pdQuoteFormatTime(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateOnly.getTime() === today.getTime()) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ', Today';
    } else if (dateOnly.getTime() === yesterday.getTime()) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ', Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

/**
 * Copy quote to clipboard
 */
function pdQuoteCopy() {
    if (!pdQuote.currentQuote) return;
    
    const text = `"${pdQuote.currentQuote.text}" — ${pdQuote.currentQuote.author}`;
    
    // Try Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✓ Quote copied!', 'success');
            announce('Quote copied to clipboard');
        }).catch(() => {
            pdQuoteCopyFallback(text);
        });
    } else {
        pdQuoteCopyFallback(text);
    }
}

/**
 * Fallback copy method
 */
function pdQuoteCopyFallback(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✓ Quote copied!', 'success');
        announce('Quote copied to clipboard');
    } catch (e) {
        showToast('Could not copy quote', 'error');
    }
}

/**
 * Toggle favorite status
 */
function pdQuoteToggleFavorite() {
    if (!pdQuote.currentQuote) return;
    
    if (pdQuoteIsFavorite(pdQuote.currentQuote)) {
        // Remove from favorites
        pdQuote.favorites = pdQuote.favorites.filter(q => 
            q.text !== pdQuote.currentQuote.text
        );
        showToast('💔 Removed from favorites', 'info');
    } else {
        // Add to favorites
        pdQuote.favorites.push({...pdQuote.currentQuote});
        showToast('❤️ Added to favorites!', 'success');
    }
    
    StorageManager.set(pdQuote.favoritesKey, pdQuote.favorites);
    pdQuoteUpdateFavoritesCount();
    pdQuoteRender();
}

/**
 * Check if quote is favorite
 */
function pdQuoteIsFavorite(quote) {
    return pdQuote.favorites.some(q => q.text === quote.text);
}

/**
 * Update favorites count badge
 */
function pdQuoteUpdateFavoritesCount() {
    const countEl = document.querySelector('.pd-quote-favorites-count');
    if (countEl) {
        countEl.textContent = pdQuote.favorites.length;
        countEl.setAttribute('aria-label', pdQuote.favorites.length + ' favorite quotes');
    }
}

/**
 * Open favorites modal
 */
function pdQuoteOpenFavoritesModal() {
    Modal.open('pd-quote-favorites-modal');
    pdQuoteRenderFavorites();
}

/**
 * Render favorites list
 */
function pdQuoteRenderFavorites() {
    const list = document.getElementById('pd-favorites-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (pdQuote.favorites.length === 0) {
        list.innerHTML = '<li class="pd-calendar-no-events">No favorites yet. Click "Save" on a quote!</li>';
        return;
    }
    
    pdQuote.favorites.forEach((quote, index) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'listitem');
        li.innerHTML = `
            <div class="pd-favorites-item-text">"${pdQuoteEscapeHtml(quote.text)}"</div>
            <div class="pd-favorites-item-author">— ${pdQuoteEscapeHtml(quote.author)}</div>
            <div class="pd-favorites-item-actions">
                <button class="pd-favorites-item-btn copy-btn" data-index="${index}" title="Copy quote" aria-label="Copy quote">
                    📋
                </button>
                <button class="pd-favorites-item-btn set-btn" data-index="${index}" title="Use as current" aria-label="Use as current quote">
                    ✓
                </button>
                <button class="pd-favorites-item-btn remove-btn" data-index="${index}" title="Remove from favorites" aria-label="Remove from favorites">
                    🗑️
                </button>
            </div>
        `;
        
        const copyBtn = li.querySelector('.copy-btn');
        const setBtn = li.querySelector('.set-btn');
        const removeBtn = li.querySelector('.remove-btn');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = `"${quote.text}" — ${quote.author}`;
                navigator.clipboard?.writeText(text).then(() => {
                    showToast('✓ Copied!', 'success');
                }).catch(() => pdQuoteCopyFallback(text));
            });
        }
        
        if (setBtn) {
            setBtn.addEventListener('click', () => {
                pdQuote.currentQuote = {...quote, timestamp: Date.now()};
                StorageManager.set(pdQuote.storageKey, pdQuote.currentQuote);
                pdQuoteRender();
                Modal.close('pd-quote-favorites-modal');
                showToast('✓ Quote updated!', 'success');
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                pdQuote.favorites.splice(index, 1);
                StorageManager.set(pdQuote.favoritesKey, pdQuote.favorites);
                pdQuoteRenderFavorites();
                pdQuoteUpdateFavoritesCount();
                showToast('💔 Removed from favorites', 'info');
            });
        }
        
        list.appendChild(li);
    });
}

/**
 * Escape HTML
 */
function pdQuoteEscapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize on DOM ready
 */
if (typeof StorageManager === 'undefined') {
    console.warn('StorageManager not found. Quote widget requires main script.js.');
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', pdQuoteInit);
    } else {
        pdQuoteInit();
    }
}
