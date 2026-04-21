// ─── SOURCES: GLOBAL / INTERNATIONAL ──────────────────────────────────────────
// Multi-country and global databases. These form the backbone of the tool and
// cover every country through their international reporting obligations.

const SOURCES_GLOBAL = {

    // ── Research ───────────────────────────────────────────────────────────
    pubmed: {
        label:      "PubMed / NCBI",
        country:    "Global",
        key:        "",   // optional — https://ncbi.nlm.nih.gov/account (raises rate limit 3→10 req/s)
        enabled:    true,
        categories: ['health']
    },

    // ── Health ─────────────────────────────────────────────────────────────
    who: {
        label:      "WHO Global Health Observatory",
        country:    "Global",
        key:        "",   // no key required — https://www.who.int/data/gho/info/gho-odata-api
        enabled:    true,
        categories: ['health', 'demographics']
    },

    // ── Economics & Development ────────────────────────────────────────────
    worldbank: {
        label:      "World Bank Open Data",
        country:    "Global",
        key:        "",   // no key required — https://datahelpdesk.worldbank.org/knowledgebase/articles/889386
        enabled:    true,
        categories: ['finance', 'demographics', 'environment', 'labor']
    },
    imf: {
        label:      "IMF DataMapper",
        country:    "Global",
        key:        "",   // no key required — https://www.imf.org/external/datamapper/api/v1/
        enabled:    false,
        categories: ['finance']
    },
    oecd: {
        label:      "OECD Statistics",
        country:    "Global",
        key:        "",   // no key required — https://data.oecd.org/api/
        enabled:    false,
        categories: ['finance', 'labor', 'demographics', 'environment']
    },

    // ── Labor ──────────────────────────────────────────────────────────────
    ilo: {
        label:      "ILO Statistics (ILOSTAT)",
        country:    "Global",
        key:        "",   // no key required — https://ilostat.ilo.org/resources/ilostat-api/
        enabled:    false,
        categories: ['labor', 'demographics']
    },

    // ── General ────────────────────────────────────────────────────────────
    un: {
        label:      "UN Data",
        country:    "Global",
        key:        "",   // no key required — https://data.un.org/Host.aspx?Content=API
        enabled:    false,
        categories: ['demographics', 'environment', 'finance', 'health']
    },
    fao: {
        label:      "FAO (Food and Agriculture Organization)",
        country:    "Global",
        key:        "",   // no key required — https://fenixservices.fao.org/faostat/api/v1/
        enabled:    false,
        categories: ['environment', 'demographics']
    },
    unicef: {
        label:      "UNICEF Data",
        country:    "Global",
        key:        "",   // no key required — https://data.unicef.org/resources/dataset/
        enabled:    false,
        categories: ['health', 'demographics']
    },
    unesco: {
        label:      "UNESCO Institute for Statistics",
        country:    "Global",
        key:        "",   // no key required — https://apiportal.uis.unesco.org/
        enabled:    false,
        categories: ['demographics']
    },
};

window.SOURCES_GLOBAL = SOURCES_GLOBAL;
