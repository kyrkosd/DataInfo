/* global BACKEND_URL, fetchWithBackoff, getAuthHeaders */

// ─── analyzeClaim ─────────────────────────────────────────────────────────────
async function analyzeClaim(query) {
    try {
        window.__di?.setLoadingMsg?.('Querying official databases...');
        const res = await fetchWithBackoff(`${BACKEND_URL}/api/analyze`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
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
async function analyzeClaimWeb(query) {
    try {
        window.__di?.setLoadingMsg?.('Searching the web...');
        const res = await fetchWithBackoff(`${BACKEND_URL}/api/analyze-web`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
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
