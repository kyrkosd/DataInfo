// ─── DOM helpers ──────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

// Cached DOM references — used across api.js, analyze.js, and ui.js
const searchInput         = $('searchInput');
const loadingState        = $('loadingState');
const resultContainer     = $('resultContainer');
const autocorrectFeedback = $('autocorrectFeedback');

// Tracks the active tab: 'official' (RAG, no web) or 'web' (Google Search grounding)
let activeTab = 'official';

// ─── applyAutocorrect ─────────────────────────────────────────────────────────
// Splits the query into words, checks each against AUTOCORRECT, rebuilds the string.
// Shows a notice and updates the input field if any correction was made.
function applyAutocorrect(query) {
    const corrected = query.split(/\s+/).map(word => {
        const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        return AUTOCORRECT[clean]
            ? word.toLowerCase().replace(clean, AUTOCORRECT[clean])
            : word;
    }).join(' ');

    if (corrected.toLowerCase() !== query.toLowerCase()) {
        autocorrectFeedback.textContent = `Auto-corrected to: "${corrected}"`;
        autocorrectFeedback.classList.remove('hidden');
        searchInput.value = corrected;
        return corrected;
    }
    autocorrectFeedback.classList.add('hidden');
    return query;
}

// ─── detectTopics ─────────────────────────────────────────────────────────────
// Returns a Set of topic names matched by keyword substring search.
// Empty Set → analyzeClaim() falls back to querying all enabled sources.
function detectTopics(query) {
    const q       = query.toLowerCase();
    const matched = new Set();
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(kw => q.includes(kw))) matched.add(topic);
    }
    return matched;
}

// ─── fetchWithBackoff ─────────────────────────────────────────────────────────
// Wraps fetch() with exponential backoff for 429 / 5xx responses.
// Non-retryable errors (400, 401, 403) are returned immediately.
async function fetchWithBackoff(url, options, maxRetries = 3) {
    let lastRes;
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const res = await fetch(url, options);
            lastRes = res; // Store the latest response
            if (res.ok || (res.status !== 429 && res.status < 500)) return res;
        } catch (e) {
            // On network error, if it's the last attempt, re-throw the error.
            if (i === maxRetries - 1) throw e;
        }
        // Wait before the next retry, but not after the last attempt.
        if (i < maxRetries - 1) {
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
    return lastRes; // Return the last response if all retries failed.
}
