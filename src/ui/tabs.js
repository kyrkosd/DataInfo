// ─── UI: TABS ─────────────────────────────────────────────────────────────────
// switchTab — activates a tab, swaps description text, shows/hides disclaimer,
// and clears any stale result from the previous tab.

function switchTab(tab) {
    activeTab = tab;
    const isWeb = tab === 'web';

    $('tabOfficial').classList.toggle('tab-active', !isWeb);
    $('tabWeb').classList.toggle('tab-active', isWeb);

    $('pageDesc').textContent = isWeb
        ? 'Enter a claim below. Gemini will search the general web for relevant information.'
        : 'Enter a statistical claim below. Our tool queries official databases and cites verified sources.';

    $('webDisclaimer').classList.toggle('hidden', !isWeb);

    resultContainer.classList.add('hidden');
    autocorrectFeedback.classList.add('hidden');
}
