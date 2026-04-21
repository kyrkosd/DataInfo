// ─── SOURCES: OCEANIA ─────────────────────────────────────────────────────────
// Official statistical sources for Australia, New Zealand, and the Pacific Islands.

const SOURCES_OCEANIA = {

    // ── Australia ──────────────────────────────────────────────────────────
    aus_abs: {
        label:      "ABS (Australian Bureau of Statistics)",
        country:    "Australia",
        key:        "",   // no key required — https://api.data.abs.gov.au/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor', 'health']
    },
    aus_rba: {
        label:      "Reserve Bank of Australia",
        country:    "Australia",
        key:        "",   // no key required — https://www.rba.gov.au/statistics/tables/
        enabled:    false,
        categories: ['finance']
    },
    aus_aihw: {
        label:      "AIHW (Australian Institute of Health and Welfare)",
        country:    "Australia",
        key:        "",   // no key required — https://www.aihw.gov.au/reports-data/
        enabled:    false,
        categories: ['health']
    },
    aus_abs_environment: {
        label:      "ABS Environmental-Economic Accounts (Australia)",
        country:    "Australia",
        key:        "",   // no key required — https://www.abs.gov.au/statistics/environment/
        enabled:    false,
        categories: ['environment']
    },

    // ── New Zealand ────────────────────────────────────────────────────────
    nzl_statsnz: {
        label:      "Stats NZ",
        country:    "New Zealand",
        key:        "",   // no key required — https://www.stats.govt.nz/large-datasets/csv-files-for-download/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor', 'environment']
    },
    nzl_rbnz: {
        label:      "Reserve Bank of New Zealand",
        country:    "New Zealand",
        key:        "",   // no key required — https://www.rbnz.govt.nz/statistics
        enabled:    false,
        categories: ['finance']
    },
    nzl_mfe: {
        label:      "Ministry for the Environment (New Zealand)",
        country:    "New Zealand",
        key:        "",   // no key required — https://www.mfe.govt.nz/publications/environmental-reporting
        enabled:    false,
        categories: ['environment']
    },

    // ── Papua New Guinea ───────────────────────────────────────────────────
    png_nso: {
        label:      "NSO (National Statistical Office, Papua New Guinea)",
        country:    "Papua New Guinea",
        key:        "",   // no key required — https://www.nso.gov.pg/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Fiji ───────────────────────────────────────────────────────────────
    fji_fbs: {
        label:      "Fiji Bureau of Statistics",
        country:    "Fiji",
        key:        "",   // no key required — https://www.statsfiji.gov.fj/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Pacific Region ─────────────────────────────────────────────────────
    pac_spc: {
        label:      "Pacific Community (SPC) Statistics",
        country:    "Pacific Islands",
        key:        "",   // no key required — https://stats.pacificdata.org/
        enabled:    false,
        categories: ['demographics', 'environment', 'health']
    },
    pac_sprep: {
        label:      "SPREP (Secretariat of the Pacific Regional Environment Programme)",
        country:    "Pacific Islands",
        key:        "",   // no key required — https://www.sprep.org/pacos
        enabled:    false,
        categories: ['environment']
    },
};

window.SOURCES_OCEANIA = SOURCES_OCEANIA;
