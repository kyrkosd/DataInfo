// ─── Official API query functions ─────────────────────────────────────────────
//
// Contract for every query function:
//   • Accepts the raw user query + optional optimized searchTerm from preprocessClaim()
//   • Returns { label, url, data, date } on success, or null on any failure
//   • Never throws — errors are caught so Promise.all() in analyzeClaim() continues
//   • date: most recent data year found (used for "Data as of" display)

// ─── queryPubMed ──────────────────────────────────────────────────────────────
// Searches peer-reviewed biomedical literature via NCBI E-utilities.
// Step 1 (esearch): find up to 3 article IDs. Step 2 (efetch): download abstracts.
async function queryPubMed(query, key, searchTerm = query) {
    const base   = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
    const keyStr = key ? `&api_key=${encodeURIComponent(key)}` : '';
    try {
        const sr = await fetch(`${base}esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmax=3&retmode=json${keyStr}`);
        if (!sr.ok) return null;
        const sd  = await sr.json();
        const ids = sd.esearchresult?.idlist;
        if (!ids?.length) return null;

        const ar   = await fetch(`${base}efetch.fcgi?db=pubmed&id=${ids.join(',')}&rettype=abstract&retmode=text${keyStr}`);
        if (!ar.ok) return null;
        const text = await ar.text();

        const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/g);
        const date      = yearMatch ? Math.max(...yearMatch.map(Number)).toString() : null;

        return {
            label: 'PubMed / NCBI',
            url:   `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(searchTerm)}`,
            data:  text.slice(0, 2500),
            date
        };
    } catch { return null; }
}

// ─── queryWorldBank ───────────────────────────────────────────────────────────
// Searches the World Bank Open Data catalogue.
// Step 1: find matching indicators. Step 2: fetch most-recent values per country.
async function queryWorldBank(query, searchTerm = query) {
    try {
        const ir = await fetch(`https://api.worldbank.org/v2/indicator?search=${encodeURIComponent(searchTerm)}&format=json&per_page=3`);
        if (!ir.ok) return null;
        const id         = await ir.json();
        const indicators = id[1];
        if (!indicators?.length) return null;

        const ind  = indicators[0];
        const dr   = await fetch(`https://api.worldbank.org/v2/country/all/indicator/${ind.id}?format=json&mrv=1&per_page=10`);
        if (!dr.ok) return null;
        const dd      = await dr.json();
        const rows    = (dd[1] || []).filter(r => r.value != null).slice(0, 8);
        const records = rows.map(r => `${r.country?.value}: ${r.value} (${r.date})`).join('\n');

        const dates = rows.map(r => parseInt(r.date)).filter(Boolean);
        const date  = dates.length ? Math.max(...dates).toString() : null;

        return {
            label: 'World Bank Open Data',
            url:   `https://data.worldbank.org/indicator/${ind.id}`,
            data:  `Indicator: ${ind.name}\n${ind.sourceNote || ''}\n\nLatest values:\n${records}`,
            date
        };
    } catch { return null; }
}

// ─── queryWHO ─────────────────────────────────────────────────────────────────
// Queries the WHO Global Health Observatory (GHO) OData API.
// Step 1: match indicator by name (3-word limit). Step 2: fetch recent data points.
async function queryWHO(query, searchTerm = query) {
    try {
        const keywords = searchTerm.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
        const ir = await fetch(`https://ghoapi.azureedge.net/api/Indicator?$filter=contains(tolower(IndicatorName),'${encodeURIComponent(keywords)}')&$top=1`);
        if (!ir.ok) return null;
        const id  = await ir.json();
        const ind = id.value?.[0];
        if (!ind) return null;

        const dr  = await fetch(`https://ghoapi.azureedge.net/api/${ind.IndicatorCode}?$top=10&$orderby=TimeDim desc`);
        if (!dr.ok) return null;
        const dd      = await dr.json();
        const rows    = (dd.value || []).slice(0, 8);
        const records = rows.map(r => `${r.SpatialDim || 'Global'}: ${r.NumericValue} (${r.TimeDim})`).join('\n');

        const years = rows.map(r => parseInt(r.TimeDim)).filter(Boolean);
        const date  = years.length ? Math.max(...years).toString() : null;

        return {
            label: 'WHO Global Health Observatory',
            url:   `https://www.who.int/data/gho/data/indicators/indicator-details/GHO/${ind.IndicatorCode}`,
            data:  `Indicator: ${ind.IndicatorName}\n\nLatest values:\n${records}`,
            date
        };
    } catch { return null; }
}

// ─── queryBLS ─────────────────────────────────────────────────────────────────
// BLS v2 API requires specific series IDs — free-text search not supported.
// Implementation pending: needs a series-ID lookup table keyed by topic.
async function queryBLS(_query, _key) { return null; }

// ─── queryCensus ──────────────────────────────────────────────────────────────
// Census API requires specific table and variable codes per dataset.
// Implementation pending: needs a dataset/variable mapping table.
async function queryCensus(_query, _key) { return null; }

// ─── queryFRED ────────────────────────────────────────────────────────────────
// Queries the Federal Reserve Bank of St. Louis economic database (FRED).
// Step 1 (series/search): finds matching series ordered by popularity.
// Step 2 (observations): fetches the 5 most recent values for that series.
async function queryFRED(query, key, searchTerm = query) {
    if (!key) return null;
    try {
        const sr = await fetch(
            `https://api.stlouisfed.org/fred/series/search?search_text=${encodeURIComponent(searchTerm)}&api_key=${encodeURIComponent(key)}&file_type=json&limit=3&order_by=popularity`
        );
        if (!sr.ok) return null;
        const sd     = await sr.json();
        const series = sd.seriess;
        if (!series?.length) return null;

        const s  = series[0];
        const or = await fetch(
            `https://api.stlouisfed.org/fred/series/observations?series_id=${s.id}&api_key=${encodeURIComponent(key)}&file_type=json&sort_order=desc&limit=5`
        );
        if (!or.ok) return null;
        const od      = await or.json();
        const obs     = (od.observations || []).filter(o => o.value !== '.').slice(0, 5);
        const records = obs.map(o => `${o.date}: ${o.value} ${s.units}`).join('\n');

        const years = obs.map(o => parseInt(o.date)).filter(Boolean);
        const date  = years.length ? Math.max(...years).toString() : null;

        return {
            label: 'FRED / Federal Reserve',
            url:   `https://fred.stlouisfed.org/series/${s.id}`,
            data:  `Series: ${s.title}\n${s.notes?.slice(0, 300) || ''}\n\nRecent observations:\n${records}`,
            date
        };
    } catch { return null; }
}

// ─── queryCDC ─────────────────────────────────────────────────────────────────
// Searches CDC Open Data (Socrata platform) for matching public health datasets.
// Step 1: catalog search by keyword. Step 2: fetch sample rows from top result.
async function queryCDC(query, key, searchTerm = query) {
    try {
        const sr = await fetch(`https://data.cdc.gov/api/views?q=${encodeURIComponent(searchTerm)}&limit=2`);
        if (!sr.ok) return null;
        const datasets = await sr.json();
        if (!datasets?.length) return null;

        const ds = datasets[0];
        const dr = await fetch(
            `https://data.cdc.gov/resource/${ds.id}.json?$limit=5${key ? `&$$app_token=${encodeURIComponent(key)}` : ''}`
        );
        if (!dr.ok) return null;
        const rows = await dr.json();
        if (!rows?.length) return null;

        const records = rows.map(r =>
            Object.entries(r).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(' | ')
        ).join('\n');

        const yearMatch = records.match(/\b(20\d{2}|19\d{2})\b/g);
        const date      = yearMatch ? Math.max(...yearMatch.map(Number)).toString() : null;

        return {
            label: 'CDC Open Data',
            url:   `https://data.cdc.gov/resource/${ds.id}`,
            data:  `Dataset: ${ds.name}\n${(ds.description || '').slice(0, 200)}\n\nSample data:\n${records}`,
            date
        };
    } catch { return null; }
}

// ─── Pending implementations ───────────────────────────────────────────────────
// These stubs maintain the correct call signature for analyze.js.
// Params prefixed with _ signal intentional non-use until implemented.
async function queryOECD(_query)              { return null; }
async function queryIMF(_query)               { return null; }
async function queryEIA(_query, _key)         { return null; }
async function queryEurostat(_query)          { return null; }
async function queryILO(_query)               { return null; }
async function queryUN(_query)                { return null; }

// Expose as browser globals — satisfies ESLint no-unused-vars.
window.queryPubMed    = queryPubMed;
window.queryWorldBank = queryWorldBank;
window.queryWHO       = queryWHO;
window.queryBLS       = queryBLS;
window.queryCensus    = queryCensus;
window.queryFRED      = queryFRED;
window.queryCDC       = queryCDC;
window.queryOECD      = queryOECD;
window.queryIMF       = queryIMF;
window.queryEIA       = queryEIA;
window.queryEurostat  = queryEurostat;
window.queryILO       = queryILO;
window.queryUN        = queryUN;
