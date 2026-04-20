// ─── UI: EVENTS ───────────────────────────────────────────────────────────────
// submit — entry point that dispatches to the active tab's analyze function.
// All DOM event listeners are registered here.

function submit() {
    const query = searchInput.value.trim();
    if (!query) return;
    const corrected = applyAutocorrect(query);
    if (activeTab === 'web') {
        analyzeClaimWeb(corrected);
    } else {
        analyzeClaim(corrected);
    }
}

// ── Search ────────────────────────────────────────────────────────────────────
$('searchSubmit').addEventListener('click', submit);
searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') submit(); });

// ── Tabs ──────────────────────────────────────────────────────────────────────
$('tabOfficial').addEventListener('click', () => switchTab('official'));
$('tabWeb').addEventListener('click',      () => switchTab('web'));

// ── Guide modal ───────────────────────────────────────────────────────────────
$('helpBtn').addEventListener('click',    () => $('guideModal').classList.remove('hidden'));
$('closeModal').addEventListener('click', () => $('guideModal').classList.add('hidden'));
$('guideModal').addEventListener('click', e => { if (e.target === $('guideModal')) $('guideModal').classList.add('hidden'); });

// ── Reasoning steps toggle ────────────────────────────────────────────────────
$('reasoningToggle').addEventListener('click', () => {
    const list  = $('reasoningList');
    const arrow = $('reasoningArrow');
    list.classList.toggle('hidden');
    arrow.textContent = list.classList.contains('hidden') ? '▼' : '▲';
});
