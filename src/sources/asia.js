// ─── SOURCES: ASIA ────────────────────────────────────────────────────────────
// Official statistical sources for Asia, South Asia, Southeast Asia,
// East Asia, and the Middle East.

const SOURCES_ASIA = {

    // ── Japan ──────────────────────────────────────────────────────────────
    jpn_estat: {
        label:      "e-Stat (Japan)",
        country:    "Japan",
        key:        "",   // https://www.e-stat.go.jp/api/en/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    jpn_boj: {
        label:      "Bank of Japan",
        country:    "Japan",
        key:        "",   // no key required — https://www.stat-search.boj.or.jp/
        enabled:    false,
        categories: ['finance']
    },

    // ── South Korea ────────────────────────────────────────────────────────
    kor_kosis: {
        label:      "KOSIS (South Korea)",
        country:    "South Korea",
        key:        "",   // https://kosis.kr/openapi/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    kor_bok: {
        label:      "Bank of Korea",
        country:    "South Korea",
        key:        "",   // https://ecos.bok.or.kr/api/
        enabled:    false,
        categories: ['finance']
    },

    // ── China ──────────────────────────────────────────────────────────────
    chn_nbs: {
        label:      "NBS (National Bureau of Statistics, China)",
        country:    "China",
        key:        "",   // no key required — https://data.stats.gov.cn/english/easyquery.htm
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    chn_pboc: {
        label:      "People's Bank of China",
        country:    "China",
        key:        "",   // no key required — https://www.pbc.gov.cn/en/3688229/
        enabled:    false,
        categories: ['finance']
    },

    // ── India ──────────────────────────────────────────────────────────────
    ind_mospi: {
        label:      "MOSPI (India)",
        country:    "India",
        key:        "",   // no key required — https://mospi.gov.in/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    ind_rbi: {
        label:      "Reserve Bank of India",
        country:    "India",
        key:        "",   // no key required — https://rbi.org.in/Scripts/DataReleasesAndPublications.aspx
        enabled:    false,
        categories: ['finance']
    },
    ind_datagov: {
        label:      "data.gov.in (India)",
        country:    "India",
        key:        "",   // https://data.gov.in/help/how-use-datasets-using-api
        enabled:    false,
        categories: ['demographics', 'health', 'environment', 'finance']
    },

    // ── Singapore ──────────────────────────────────────────────────────────
    sgp_singstat: {
        label:      "SingStat (Singapore)",
        country:    "Singapore",
        key:        "",   // no key required — https://tablebuilder.singstat.gov.sg/api-docs/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    sgp_mas: {
        label:      "Monetary Authority of Singapore",
        country:    "Singapore",
        key:        "",   // no key required — https://eservices.mas.gov.sg/api/
        enabled:    false,
        categories: ['finance']
    },

    // ── Hong Kong ──────────────────────────────────────────────────────────
    hkg_censtatd: {
        label:      "Census & Statistics Dept (Hong Kong)",
        country:    "Hong Kong",
        key:        "",   // no key required — https://www.censtatd.gov.hk/en/web_table.html
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Taiwan ─────────────────────────────────────────────────────────────
    twn_dgbas: {
        label:      "DGBAS (Taiwan)",
        country:    "Taiwan",
        key:        "",   // no key required — https://www.stat.gov.tw/en/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Malaysia ───────────────────────────────────────────────────────────
    mys_dosm: {
        label:      "DoSM (Malaysia)",
        country:    "Malaysia",
        key:        "",   // no key required — https://open.dosm.gov.my/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    mys_bnm: {
        label:      "Bank Negara Malaysia",
        country:    "Malaysia",
        key:        "",   // no key required — https://apikijangportal.bnm.gov.my/
        enabled:    false,
        categories: ['finance']
    },

    // ── Thailand ───────────────────────────────────────────────────────────
    tha_nso: {
        label:      "NSO (Thailand)",
        country:    "Thailand",
        key:        "",   // no key required — https://www.nso.go.th/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Philippines ────────────────────────────────────────────────────────
    phl_psa: {
        label:      "PSA (Philippines)",
        country:    "Philippines",
        key:        "",   // https://psa.gov.ph/data/openstat/api
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Indonesia ──────────────────────────────────────────────────────────
    idn_bps: {
        label:      "BPS (Statistics Indonesia)",
        country:    "Indonesia",
        key:        "",   // https://webapi.bps.go.id/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Vietnam ────────────────────────────────────────────────────────────
    vnm_gso: {
        label:      "GSO (General Statistics Office, Vietnam)",
        country:    "Vietnam",
        key:        "",   // no key required — https://www.gso.gov.vn/en/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Pakistan ───────────────────────────────────────────────────────────
    pak_pbs: {
        label:      "PBS (Pakistan Bureau of Statistics)",
        country:    "Pakistan",
        key:        "",   // no key required — https://www.pbs.gov.pk/
        enabled:    false,
        categories: ['demographics', 'finance']
    },
    pak_sbp: {
        label:      "State Bank of Pakistan",
        country:    "Pakistan",
        key:        "",   // no key required — https://www.sbp.org.pk/ecodata/index2.asp
        enabled:    false,
        categories: ['finance']
    },

    // ── Bangladesh ─────────────────────────────────────────────────────────
    bgd_bbs: {
        label:      "BBS (Bangladesh Bureau of Statistics)",
        country:    "Bangladesh",
        key:        "",   // no key required — https://bbs.gov.bd/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Sri Lanka ──────────────────────────────────────────────────────────
    lka_dcs: {
        label:      "DCS (Sri Lanka)",
        country:    "Sri Lanka",
        key:        "",   // no key required — https://www.statistics.gov.lk/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Israel ─────────────────────────────────────────────────────────────
    isr_cbs: {
        label:      "CBS (Israel)",
        country:    "Israel",
        key:        "",   // no key required — https://www.cbs.gov.il/en/pages/default.aspx
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Saudi Arabia ───────────────────────────────────────────────────────
    sau_gastat: {
        label:      "GASTAT (Saudi Arabia)",
        country:    "Saudi Arabia",
        key:        "",   // https://open.data.gov.sa/en
        enabled:    false,
        categories: ['demographics', 'finance', 'labor', 'energy']
    },

    // ── UAE ────────────────────────────────────────────────────────────────
    are_fcsa: {
        label:      "FCSA (UAE Federal Competitiveness and Statistics Centre)",
        country:    "United Arab Emirates",
        key:        "",   // no key required — https://fcsa.gov.ae/en-us/Pages/Statistics/Statistics.aspx
        enabled:    false,
        categories: ['demographics', 'finance', 'energy']
    },

    // ── Iran ───────────────────────────────────────────────────────────────
    irn_sci: {
        label:      "SCI (Iran Statistical Centre)",
        country:    "Iran",
        key:        "",   // no key required — https://www.amar.org.ir/english
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Iraq ───────────────────────────────────────────────────────────────
    irq_cosit: {
        label:      "COSIT (Iraq)",
        country:    "Iraq",
        key:        "",   // no key required — https://cosit.gov.iq/en/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Kazakhstan ─────────────────────────────────────────────────────────
    kaz_stat: {
        label:      "Statistics Committee (Kazakhstan)",
        country:    "Kazakhstan",
        key:        "",   // no key required — https://stat.gov.kz/en/
        enabled:    false,
        categories: ['demographics', 'finance', 'energy']
    },

    // ── Uzbekistan ─────────────────────────────────────────────────────────
    uzb_stat: {
        label:      "Statistics Agency (Uzbekistan)",
        country:    "Uzbekistan",
        key:        "",   // no key required — https://stat.uz/en/
        enabled:    false,
        categories: ['demographics', 'finance']
    },
};
