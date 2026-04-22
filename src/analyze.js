/* global BACKEND_URL, fetchWithBackoff */

// ─── analyzeClaim ─────────────────────────────────────────────────────────────
// Official Sources tab — sends query to the backend, displays result.
async function analyzeClaim(query) {
    try {
        window.__di?.setLoadingMsg?.('Querying official databases...');
        const res = await fetchWithBackoff(`${BACKEND_URL}/api/analyze`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ query })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error (${res.status})`);
        }
        window.__di?.onResult?.(await res.json());
    } catch (err) {
        window.__di?.onError?.(err.message);
    }
}

// ─── analyzeClaimWeb ──────────────────────────────────────────────────────────
// Web Search tab — sends query to the backend, displays result.
async function analyzeClaimWeb(query) {
    try {
        window.__di?.setLoadingMsg?.('Searching the web...');
        const res = await fetchWithBackoff(`${BACKEND_URL}/api/analyze-web`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ query })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error (${res.status})`);
        }
        window.__di?.onResult?.(await res.json());
    } catch (err) {
        window.__di?.onError?.(err.message);
    }
}

window.analyzeClaim    = analyzeClaim;
window.analyzeClaimWeb = analyzeClaimWeb;
