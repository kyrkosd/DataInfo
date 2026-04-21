// ─── SOURCES: AFRICA ──────────────────────────────────────────────────────────
// Official statistical sources for African countries.
// Note: most African countries' data is comprehensively covered by
// World Bank, WHO, IMF, FAO, and UN in src/sources/global.js.

const SOURCES_AFRICA = {

    // ── South Africa ───────────────────────────────────────────────────────
    zaf_statssa: {
        label:      "Stats SA (South Africa)",
        country:    "South Africa",
        key:        "",   // no key required — https://www.statssa.gov.za/?page_id=1419
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    zaf_sarb: {
        label:      "South African Reserve Bank",
        country:    "South Africa",
        key:        "",   // no key required — https://www.resbank.co.za/
        enabled:    false,
        categories: ['finance']
    },

    // ── Nigeria ────────────────────────────────────────────────────────────
    nga_nbs: {
        label:      "NBS (Nigeria)",
        country:    "Nigeria",
        key:        "",   // no key required — https://www.nigerianstat.gov.ng/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor', 'energy']
    },

    // ── Kenya ──────────────────────────────────────────────────────────────
    ken_knbs: {
        label:      "KNBS (Kenya National Bureau of Statistics)",
        country:    "Kenya",
        key:        "",   // no key required — https://www.knbs.or.ke/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    ken_opendata: {
        label:      "Kenya Open Data",
        country:    "Kenya",
        key:        "",   // no key required — https://www.opendata.go.ke/
        enabled:    false,
        categories: ['demographics', 'environment']
    },

    // ── Egypt ──────────────────────────────────────────────────────────────
    egy_capmas: {
        label:      "CAPMAS (Egypt)",
        country:    "Egypt",
        key:        "",   // no key required — https://www.capmas.gov.eg/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Ethiopia ───────────────────────────────────────────────────────────
    eth_csa: {
        label:      "CSA (Ethiopian Statistics Service)",
        country:    "Ethiopia",
        key:        "",   // no key required — https://www.statsethiopia.gov.et/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Ghana ──────────────────────────────────────────────────────────────
    gha_gss: {
        label:      "GSS (Ghana Statistical Service)",
        country:    "Ghana",
        key:        "",   // no key required — https://www.statsghana.gov.gh/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Tanzania ───────────────────────────────────────────────────────────
    tza_nbs: {
        label:      "NBS (National Bureau of Statistics, Tanzania)",
        country:    "Tanzania",
        key:        "",   // no key required — https://www.nbs.go.tz/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Morocco ────────────────────────────────────────────────────────────
    mar_hcp: {
        label:      "HCP (Haut-Commissariat au Plan, Morocco)",
        country:    "Morocco",
        key:        "",   // no key required — https://www.hcp.ma/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Algeria ────────────────────────────────────────────────────────────
    dza_ons: {
        label:      "ONS (Office National des Statistiques, Algeria)",
        country:    "Algeria",
        key:        "",   // no key required — https://www.ons.dz/
        enabled:    false,
        categories: ['demographics', 'finance', 'energy']
    },

    // ── Tunisia ────────────────────────────────────────────────────────────
    tun_ins: {
        label:      "INS (Institut National de la Statistique, Tunisia)",
        country:    "Tunisia",
        key:        "",   // no key required — https://www.ins.tn/en
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Uganda ─────────────────────────────────────────────────────────────
    uga_ubos: {
        label:      "UBOS (Uganda Bureau of Statistics)",
        country:    "Uganda",
        key:        "",   // no key required — https://www.ubos.org/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Rwanda ─────────────────────────────────────────────────────────────
    rwa_nisr: {
        label:      "NISR (Rwanda)",
        country:    "Rwanda",
        key:        "",   // no key required — https://www.statistics.gov.rw/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Senegal ────────────────────────────────────────────────────────────
    sen_ansd: {
        label:      "ANSD (Agence Nationale de la Statistique et de la Démographie, Senegal)",
        country:    "Senegal",
        key:        "",   // no key required — https://www.ansd.sn/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Côte d'Ivoire ──────────────────────────────────────────────────────
    civ_ins: {
        label:      "INS (Côte d'Ivoire)",
        country:    "Côte d'Ivoire",
        key:        "",   // no key required — https://www.ins.ci/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Cameroon ───────────────────────────────────────────────────────────
    cmr_ins: {
        label:      "INS (Institut National de la Statistique, Cameroon)",
        country:    "Cameroon",
        key:        "",   // no key required — https://www.statistics-cameroon.org/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Mozambique ─────────────────────────────────────────────────────────
    moz_ine: {
        label:      "INE (Mozambique)",
        country:    "Mozambique",
        key:        "",   // no key required — https://www.ine.gov.mz/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Zambia ─────────────────────────────────────────────────────────────
    zmb_zamstats: {
        label:      "ZamStats (Zambia Statistics Agency)",
        country:    "Zambia",
        key:        "",   // no key required — https://www.zamstats.gov.zm/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Zimbabwe ───────────────────────────────────────────────────────────
    zwe_zimstat: {
        label:      "ZIMSTAT (Zimbabwe National Statistics Agency)",
        country:    "Zimbabwe",
        key:        "",   // no key required — https://www.zimstat.co.zw/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Sudan ──────────────────────────────────────────────────────────────
    sdn_cbs: {
        label:      "CBS (Central Bureau of Statistics, Sudan)",
        country:    "Sudan",
        key:        "",   // no key required — https://www.cbs.gov.sd/en/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Angola ─────────────────────────────────────────────────────────────
    ago_ine: {
        label:      "INE (Angola)",
        country:    "Angola",
        key:        "",   // no key required — https://www.ine.gov.ao/
        enabled:    false,
        categories: ['demographics', 'finance', 'energy']
    },

    // ── Libya ──────────────────────────────────────────────────────────────
    lby_ons: {
        label:      "ONS (Libya)",
        country:    "Libya",
        key:        "",   // no key required — https://ons.gov.ly/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Madagascar ─────────────────────────────────────────────────────────
    mdg_instat: {
        label:      "INSTAT (Madagascar)",
        country:    "Madagascar",
        key:        "",   // no key required — https://www.instat.mg/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Botswana ───────────────────────────────────────────────────────────
    bwa_stats: {
        label:      "Statistics Botswana",
        country:    "Botswana",
        key:        "",   // no key required — https://www.statsbots.org.bw/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Namibia ────────────────────────────────────────────────────────────
    nam_nsa: {
        label:      "NSA (Namibia Statistics Agency)",
        country:    "Namibia",
        key:        "",   // no key required — https://www.nsa.org.na/
        enabled:    false,
        categories: ['demographics', 'finance']
    },
};

window.SOURCES_AFRICA = SOURCES_AFRICA;
