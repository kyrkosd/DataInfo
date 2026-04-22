/* global AUTOCORRECT, TOPIC_KEYWORDS */

// ─── DOM helper ───────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── Cached DOM elements ──────────────────────────────────────────────────────
const searchInput         = $('searchInput');
const loadingState        = $('loadingState');
const resultContainer     = $('resultContainer');
const autocorrectFeedback = $('autocorrectFeedback');

// ─── applyAutocorrect ─────────────────────────────────────────────────────────
// Pure function — returns the corrected string. React UI handles the notice.
function applyAutocorrect(query) {
    return query.split(/\s+/).map(word => {
        const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        return AUTOCORRECT[clean]
            ? word.toLowerCase().replace(clean, AUTOCORRECT[clean])
            : word;
    }).join(' ');
}

// ─── detectTopics ─────────────────────────────────────────────────────────────
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
async function fetchWithBackoff(url, options, maxRetries = 3) {
    let lastRes;
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const res = await fetch(url, options);
            lastRes = res;
            if (res.ok || (res.status !== 429 && res.status < 500)) return res;
        } catch (e) {
            if (i === maxRetries - 1) throw e;
        }
        if (i < maxRetries - 1) {
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
    if (!lastRes) throw new Error('Network error — no response received after retries');
    return lastRes;
}

window.$                  = $;
window.applyAutocorrect   = applyAutocorrect;
window.detectTopics       = detectTopics;
window.fetchWithBackoff   = fetchWithBackoff;
window.searchInput        = searchInput;
window.loadingState       = loadingState;
window.resultContainer    = resultContainer;
window.autocorrectFeedback = autocorrectFeedback;
