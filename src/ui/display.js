/* global $, loadingState, resultContainer */

// ─── UI: DISPLAY ──────────────────────────────────────────────────────────────
// showError and displayResult — populate and show the result card.

function showError(message) {
    loadingState.classList.add('hidden');
    loadingState.classList.remove('flex');
    displayResult({ status: "false", title: "Error", text: message, sources: [] });
}

function displayResult(data, sourceLabel = 'Verified Sources:') {
    const STYLES = {
        true:    { cls: 'status-true',    badge: 'VERIFIED',           badgeCls: 'bg-emerald-200 text-emerald-800', statusCls: 'text-emerald-700' },
        partial: { cls: 'status-partial', badge: 'UPDATED CONTEXT',    badgeCls: 'bg-amber-200 text-amber-800',    statusCls: 'text-amber-700'   },
        false:   { cls: 'status-false',   badge: 'UNVERIFIED / FALSE', badgeCls: 'bg-rose-200 text-rose-800',      statusCls: 'text-rose-700'    },
        no_data: { cls: 'status-no_data', badge: 'NO OFFICIAL DATA',   badgeCls: 'bg-slate-200 text-slate-700',    statusCls: 'text-slate-600'   },
    };
    const s = STYLES[data.status] || STYLES.false;

    resultContainer.className     = `max-w-3xl mx-auto mt-12 border-l-4 rounded-r-xl p-6 shadow-sm ${s.cls}`;
    $('resultStatus').textContent = data.title;
    $('resultStatus').className   = `text-2xl font-bold uppercase tracking-wide ${s.statusCls}`;
    $('resultText').textContent   = data.text;
    $('resultBadge').textContent  = s.badge;
    $('resultBadge').className    = `px-3 py-1 rounded-full text-sm font-bold ${s.badgeCls}`;
    $('sourcesLabel').textContent = sourceLabel;

    // Metric disambiguation
    if (data.metric_used) {
        $('metricUsed').textContent = data.metric_used;
        $('metricInfo').classList.remove('hidden');

        const altList = $('alternativesList');
        altList.innerHTML = '';
        const alts = data.alternatives || [];
        if (alts.length) {
            alts.forEach(alt => {
                const li = document.createElement('li');
                li.textContent = alt;
                altList.appendChild(li);
            });
            $('alternativesSection').classList.remove('hidden');
        } else {
            $('alternativesSection').classList.add('hidden');
        }
    } else {
        $('metricInfo').classList.add('hidden');
    }

    // Data vintage
    const vintage = $('dataVintage');
    if (data.data_vintage) {
        vintage.textContent = `Data as of: ${data.data_vintage}`;
        vintage.classList.remove('hidden');
    } else {
        vintage.classList.add('hidden');
    }

    // Challenge classification & confidence (FEVEROUS taxonomy)
    const challengeDiv = $('challengeInfo');
    const hasChallenge = data.challenge_type && data.challenge_type !== 'None';
    const hasConf      = !!data.confidence;
    if (hasChallenge || hasConf) {
        const cBadge = $('challengeBadge');
        if (hasChallenge) {
            cBadge.textContent = data.challenge_type;
            cBadge.classList.remove('hidden');
        } else {
            cBadge.classList.add('hidden');
        }
        if (hasConf) {
            const confStyles = { high: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-rose-100 text-rose-700' };
            const confBadge  = $('confidenceBadge');
            confBadge.textContent = data.confidence.charAt(0).toUpperCase() + data.confidence.slice(1) + ' confidence';
            confBadge.className   = `px-2 py-0.5 rounded text-xs font-semibold ${confStyles[data.confidence] || 'bg-stone-100 text-stone-600'}`;
            confBadge.classList.remove('hidden');
        } else {
            $('confidenceBadge').classList.add('hidden');
        }
        challengeDiv.classList.remove('hidden');
    } else {
        challengeDiv.classList.add('hidden');
    }

    // Reasoning steps (FEVEROUS annotation trail)
    const reasoningSection = $('reasoningSection');
    const steps = data.reasoning_steps || [];
    if (steps.length) {
        const list = $('reasoningList');
        list.innerHTML = '';
        steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            list.appendChild(li);
        });
        list.classList.add('hidden');
        $('reasoningArrow').textContent = '▼';
        reasoningSection.classList.remove('hidden');
    } else {
        reasoningSection.classList.add('hidden');
    }

    // Source links
    const ul = $('resultSources');
    ul.innerHTML = '';
    (data.sources || []).forEach(src => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${src.url}" class="hover:underline">${src.name}</a>`;
        ul.appendChild(li);
    });

    resultContainer.classList.remove('hidden');
}

window.showError     = showError;
window.displayResult = displayResult;
