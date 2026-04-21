/* global GEMINI_API_KEY, GEMINI_MODEL, API_SOURCES,
          detectTopics, fetchWithBackoff,
          queryPubMed, queryWorldBank, queryWHO, queryBLS, queryCensus,
          queryFRED, queryCDC, queryOECD, queryIMF, queryEIA,
          queryEurostat, queryILO, queryUN */
/* exported analyzeClaim, analyzeClaimWeb */

// ─── preprocessClaim ─────────────────────────────────────────────────────────
// Makes a fast Gemini call BEFORE any API queries to extract structured intent.
// Returns: topic, geography, time_period, metric, and per-API optimized search terms.
// Falls back to null on any failure — analyzeClaim() uses detectTopics() as fallback.
async function preprocessClaim(query) {
    if (!GEMINI_API_KEY) return null;
    try {
        const prompt = `Extract structured intent from this statistical claim. Respond with a valid JSON object only — no markdown, no extra text.

CLAIM: "${query}"

{
  "topic": "health | finance | labor | demographics | environment | general",
  "geography": "country or region name, or 'global' if not specified",
  "time_period": "specific year or range (e.g. '2023', '2020-2023'), or 'latest' if not specified",
  "metric": "the specific statistic being claimed in plain English",
  "search_terms": {
    "pubmed": "optimized 3-5 word medical/scientific search string",
    "worldbank": "optimized 3-5 word World Bank indicator search string",
    "who": "optimized 2-3 word WHO indicator search string (strict limit)"
  }
}`;

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const raw  = data.candidates[0].content.parts[0].text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(raw);
    } catch { return null; }
}

// ─── analyzeClaim ─────────────────────────────────────────────────────────────
// Official Sources tab — RAG mode. Gemini only sees data we fetch from APIs.
// Calls window.__di.onResult / window.__di.onError when done.
async function analyzeClaim(query) {
    if (!GEMINI_API_KEY) {
        window.__di?.onError?.("API key not set. Add your Gemini API key to GEMINI_API_KEY in src/config.js.");
        return;
    }

    try {
        window.__di?.setLoadingMsg?.('Understanding your claim...');
        const intent = await preprocessClaim(query);

        const topics = (intent?.topic && intent.topic !== 'general')
            ? new Set([intent.topic])
            : detectTopics(query);

        const selected = Object.entries(API_SOURCES).filter(([, src]) => {
            if (!src.enabled) return false;
            if (topics.size === 0) return true;
            return src.categories.some(c => topics.has(c));
        });

        const topicLabel = topics.size ? [...topics].join(', ') : 'general';
        window.__di?.setLoadingMsg?.(`Querying ${selected.map(([, s]) => s.label).join(', ') || 'sources'}...`);

        const EVIDENCE_TYPES = {
            pubmed: 'Research Abstract', worldbank: 'Statistical Indicator',
            who: 'Statistical Indicator', bls: 'Labor Statistics',
            census: 'Census Data', fred: 'Economic Time Series',
            cdc: 'Public Health Data', oecd: 'Statistical Indicator',
            imf: 'Financial Indicator', eia: 'Energy Statistics',
            eurostat: 'EU Statistical Data', ilo: 'Labor Statistics',
            un: 'UN Statistical Data'
        };

        const fetches = selected.map(([key, src]) => {
            const terms = intent?.search_terms || {};
            let p;
            if      (key === 'pubmed')     p = queryPubMed(query, src.key, terms.pubmed);
            else if (key === 'worldbank')  p = queryWorldBank(query, terms.worldbank);
            else if (key === 'who')        p = queryWHO(query, terms.who);
            else if (key === 'bls')        p = queryBLS(query, src.key);
            else if (key === 'census')     p = queryCensus(query, src.key);
            else if (key === 'fred')       p = queryFRED(query, src.key, terms.fred);
            else if (key === 'cdc')        p = queryCDC(query, src.key, terms.cdc);
            else if (key === 'oecd')       p = queryOECD(query, terms.oecd);
            else if (key === 'imf')        p = queryIMF(query, terms.imf);
            else if (key === 'eia')        p = queryEIA(query, src.key, terms.eia);
            else if (key === 'eurostat')   p = queryEurostat(query, terms.eurostat);
            else if (key === 'ilo')        p = queryILO(query, terms.ilo);
            else if (key === 'un')         p = queryUN(query, terms.un);
            else                           p = Promise.resolve(null);
            const evType = EVIDENCE_TYPES[key] || 'Official Data';
            return p.then(r => r ? { ...r, evidence_type: evType } : null);
        });

        const results = (await Promise.all(fetches)).filter(Boolean);

        if (!results.length) {
            window.__di?.onResult?.({
                status:  'no_data',
                title:   'No Official Data Found',
                text:    `No results from the ${topicLabel} sources. Try rephrasing, or enable additional sources in src/config.js.`,
                sources: []
            });
            return;
        }

        window.__di?.setLoadingMsg?.('Analysing with official data...');
        const context     = results.map(r => `=== ${r.label} [${r.evidence_type || 'Official Data'}] ===\n${r.data}`).join('\n\n');
        const geoContext  = intent?.geography  ? `Geographic focus: ${intent.geography}.`         : '';
        const timeContext = intent?.time_period ? `Time period referenced: ${intent.time_period}.` : '';

        const prompt = `You are a strict statistical fact-checker.

Below is data retrieved directly from official sources. Each source is labeled with its evidence type.
Use ONLY this data — do not add, infer, or hallucinate any information not present below.
If the claim requires combining data from multiple sources, do so explicitly.
${geoContext} ${timeContext}

OFFICIAL DATA:
${context}

CLAIM TO VERIFY: "${query}"

Based solely on the data above:
- If the data confirms the claim, set status to "true".
- If the data partially supports or contradicts the claim, set status to "partial".
- If the data clearly refutes the claim, set status to "false".
- If the data is insufficient or unrelated to verify the claim, set status to "no_data".

IMPORTANT — also include:
- metric_used: the exact metric/definition from the data used to evaluate this claim. Be specific.
- alternatives: an array of other metric definitions that could give a different result. Empty array if none.
- data_vintage: the most recent data year/period used. Add "(preliminary)" if the data may be revised.
- challenge_type: one of: "Numerical Reasoning" | "Multi-hop Reasoning" | "Entity Disambiguation" | "Combining Tables and Text" | "Insufficient Data" | "None"
- reasoning_steps: array of 2-4 short sentences showing the logical steps taken to reach the verdict
- confidence: "high" if data directly confirms or refutes the claim, "medium" if partially, "low" if inferred or sparse

Respond with a valid JSON object only — no markdown, no extra text:
{
  "status": "true" | "partial" | "false" | "no_data",
  "title": "Short Title",
  "text": "Detailed explanation citing specific numbers from the data above",
  "metric_used": "The specific metric/definition used",
  "alternatives": ["alternative 1", "alternative 2"],
  "data_vintage": "Year or period of data used",
  "challenge_type": "None",
  "reasoning_steps": ["step 1", "step 2"],
  "confidence": "high | medium | low"
}`;

        const res = await fetchWithBackoff(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${res.status}`);
        }

        const data   = await res.json();
        const raw    = data.candidates[0].content.parts[0].text.replace(/```json\n?|```/g, '').trim();
        const result = JSON.parse(raw);

        result.sources = results.map(r => ({ name: r.label, url: r.url, evidence: r.evidence_type }));

        if (!result.data_vintage) {
            const dates = results.map(r => r.date).filter(Boolean);
            if (dates.length) result.data_vintage = dates.sort().reverse()[0];
        }

        window.__di?.onResult?.(result);
    } catch (err) {
        window.__di?.onError?.(err.message);
    }
}

// ─── analyzeClaimWeb ──────────────────────────────────────────────────────────

// Web Search tab — Google Search grounding enabled.
// Sources extracted from groundingMetadata.groundingChunks in the response.
async function analyzeClaimWeb(query) {
    if (!GEMINI_API_KEY) {
        window.__di?.onError?.("API key not set. Add your Gemini API key to GEMINI_API_KEY in src/config.js.");
        return;
    }

    try {
        window.__di?.setLoadingMsg?.('Searching the web...');

        const prompt = `You are a fact-checker that searches the web broadly for up-to-date information.

Analyze the following claim: "${query}"

Use web search to find relevant, recent information from news articles, research papers, government websites, and other credible online sources.

Based on what you find:
- If credible sources confirm the claim, set status to "true".
- If sources partially support it or important context changes the meaning, set status to "partial".
- If credible sources contradict the claim, set status to "false".
- If you cannot find enough information, set status to "no_data".

Respond with a valid JSON object only — no markdown, no extra text:
{ "status": "true" | "partial" | "false" | "no_data", "title": "Short Title", "text": "Detailed explanation citing specific sources and data found on the web" }`;

        const res = await fetchWithBackoff(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ googleSearch: {} }]
                })
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${res.status}`);
        }

        const data      = await res.json();
        const candidate = data.candidates[0];
        const raw       = candidate.content.parts[0].text.replace(/```json\n?|```/g, '').trim();

        let result;
        try {
            result = JSON.parse(raw);
        } catch {
            result = { status: 'partial', title: 'Web Search Result', text: raw };
        }

        const chunks = candidate.groundingMetadata?.groundingChunks || [];
        result.sources = chunks
            .filter(c => c.web?.uri)
            .map(c => ({ name: c.web.title || c.web.uri, url: c.web.uri }));

        if (!result.sources.length) {
            result.sources = [{ name: 'General web search (no specific sources cited)', url: '#' }];
        }

        window.__di?.onResult?.(result);
    } catch (err) {
        window.__di?.onError?.(err.message);
    }
}

// Expose as browser globals — satisfies ESLint no-unused-vars and lets the React UI call them.
window.analyzeClaim    = analyzeClaim;
window.analyzeClaimWeb = analyzeClaimWeb;
