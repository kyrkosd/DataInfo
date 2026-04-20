// ─── SOURCES: EUROPE ──────────────────────────────────────────────────────────
// Official statistical sources for European countries and the European Union.

const SOURCES_EUROPE = {

    // ── European Union ─────────────────────────────────────────────────────
    eurostat: {
        label:      "Eurostat",
        country:    "European Union",
        key:        "",   // no key required — https://ec.europa.eu/eurostat/web/json-and-unicode-web-services
        enabled:    false,
        categories: ['demographics', 'finance', 'environment', 'labor']
    },
    eu_ecb: {
        label:      "European Central Bank",
        country:    "European Union",
        key:        "",   // no key required — https://data.ecb.europa.eu/
        enabled:    false,
        categories: ['finance']
    },
    eu_eea: {
        label:      "European Environment Agency",
        country:    "European Union",
        key:        "",   // no key required — https://www.eea.europa.eu/data-and-maps/data/
        enabled:    false,
        categories: ['environment']
    },

    // ── United Kingdom ─────────────────────────────────────────────────────
    uk_ons: {
        label:      "UK Office for National Statistics",
        country:    "United Kingdom",
        key:        "",   // no key required — https://api.ons.gov.uk/
        enabled:    false,
        categories: ['demographics', 'labor', 'finance']
    },
    uk_boe: {
        label:      "Bank of England",
        country:    "United Kingdom",
        key:        "",   // no key required — https://www.bankofengland.co.uk/boeapps/database/
        enabled:    false,
        categories: ['finance']
    },

    // ── Germany ────────────────────────────────────────────────────────────
    deu_destatis: {
        label:      "Destatis (Germany)",
        country:    "Germany",
        key:        "",   // no key required — https://www-genesis.destatis.de/genesis/online
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    deu_bundesbank: {
        label:      "Deutsche Bundesbank",
        country:    "Germany",
        key:        "",   // no key required — https://api.bundesbank.de/service/v1/
        enabled:    false,
        categories: ['finance']
    },

    // ── France ─────────────────────────────────────────────────────────────
    fra_insee: {
        label:      "INSEE (France)",
        country:    "France",
        key:        "",   // https://api.insee.fr/catalogue/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    fra_banquefrance: {
        label:      "Banque de France",
        country:    "France",
        key:        "",   // https://developer.banque-france.fr/
        enabled:    false,
        categories: ['finance']
    },

    // ── Italy ──────────────────────────────────────────────────────────────
    ita_istat: {
        label:      "ISTAT (Italy)",
        country:    "Italy",
        key:        "",   // no key required — https://www.istat.it/en/methods-and-tools/web-service
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    ita_bancaitalia: {
        label:      "Banca d'Italia",
        country:    "Italy",
        key:        "",   // no key required — https://www.bancaditalia.it/statistiche/
        enabled:    false,
        categories: ['finance']
    },

    // ── Spain ──────────────────────────────────────────────────────────────
    esp_ine: {
        label:      "INE (Spain)",
        country:    "Spain",
        key:        "",   // no key required — https://www.ine.es/dyngs/DataLab/en/manual.html
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Netherlands ────────────────────────────────────────────────────────
    nld_cbs: {
        label:      "CBS (Netherlands)",
        country:    "Netherlands",
        key:        "",   // no key required — https://www.cbs.nl/en-gb/our-services/open-data/statline-as-open-data
        enabled:    false,
        categories: ['demographics', 'finance', 'labor', 'environment']
    },

    // ── Sweden ─────────────────────────────────────────────────────────────
    swe_scb: {
        label:      "SCB (Statistics Sweden)",
        country:    "Sweden",
        key:        "",   // no key required — https://www.scb.se/en/services/statistical-programs-for-px-files/api/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Norway ─────────────────────────────────────────────────────────────
    nor_ssb: {
        label:      "SSB (Statistics Norway)",
        country:    "Norway",
        key:        "",   // no key required — https://data.ssb.no/api/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    nor_norgesbank: {
        label:      "Norges Bank",
        country:    "Norway",
        key:        "",   // no key required — https://data.norges-bank.no/api/
        enabled:    false,
        categories: ['finance']
    },

    // ── Denmark ────────────────────────────────────────────────────────────
    dnk_dst: {
        label:      "Statistics Denmark",
        country:    "Denmark",
        key:        "",   // no key required — https://api.statbank.dk/console
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Finland ────────────────────────────────────────────────────────────
    fin_statfi: {
        label:      "Statistics Finland",
        country:    "Finland",
        key:        "",   // no key required — https://stat.fi/en/statistics/open_data
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Switzerland ────────────────────────────────────────────────────────
    che_fso: {
        label:      "Swiss Federal Statistical Office",
        country:    "Switzerland",
        key:        "",   // no key required — https://www.bfs.admin.ch/bfs/en/home/services/ogd.html
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    che_snb: {
        label:      "Swiss National Bank",
        country:    "Switzerland",
        key:        "",   // no key required — https://data.snb.ch/en
        enabled:    false,
        categories: ['finance']
    },

    // ── Austria ────────────────────────────────────────────────────────────
    aut_stataut: {
        label:      "Statistics Austria",
        country:    "Austria",
        key:        "",   // no key required — https://www.statistik.at/en/services/open-government-data
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    aut_oenb: {
        label:      "Oesterreichische Nationalbank",
        country:    "Austria",
        key:        "",   // no key required — https://www.oenb.at/en/Statistics.html
        enabled:    false,
        categories: ['finance']
    },

    // ── Belgium ────────────────────────────────────────────────────────────
    bel_statbel: {
        label:      "Statbel (Belgium)",
        country:    "Belgium",
        key:        "",   // no key required — https://statbel.fgov.be/en/about-statbel/opendata
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Portugal ───────────────────────────────────────────────────────────
    prt_ine: {
        label:      "INE Portugal",
        country:    "Portugal",
        key:        "",   // no key required — https://www.ine.pt/xportal/xmain?xpgid=ine_api
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Poland ─────────────────────────────────────────────────────────────
    pol_gus: {
        label:      "GUS (Statistics Poland)",
        country:    "Poland",
        key:        "",   // no key required — https://api.stat.gov.pl/en/api-dbw/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Czechia ────────────────────────────────────────────────────────────
    cze_czso: {
        label:      "CZSO (Czech Statistical Office)",
        country:    "Czechia",
        key:        "",   // no key required — https://vdb.czso.cz/vdbvo2/faces/en/index.jsf
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Hungary ────────────────────────────────────────────────────────────
    hun_ksh: {
        label:      "KSH (Hungary)",
        country:    "Hungary",
        key:        "",   // no key required — https://www.ksh.hu/stadat_files/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Romania ────────────────────────────────────────────────────────────
    rou_insse: {
        label:      "INS (Romania)",
        country:    "Romania",
        key:        "",   // no key required — https://www.insse.ro/cms/en
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Greece ─────────────────────────────────────────────────────────────
    grc_elstat: {
        label:      "ELSTAT (Greece)",
        country:    "Greece",
        key:        "",   // no key required — https://www.statistics.gr/en/home/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Ireland ────────────────────────────────────────────────────────────
    irl_cso: {
        label:      "CSO (Ireland)",
        country:    "Ireland",
        key:        "",   // no key required — https://data.cso.ie/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Russia ─────────────────────────────────────────────────────────────
    rus_rosstat: {
        label:      "Rosstat (Russia)",
        country:    "Russia",
        key:        "",   // no key required — https://eng.rosstat.gov.ru/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Turkey ─────────────────────────────────────────────────────────────
    tur_turkstat: {
        label:      "TurkStat (Turkey)",
        country:    "Turkey",
        key:        "",   // no key required — https://data.tuik.gov.tr/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Ukraine ────────────────────────────────────────────────────────────
    ukr_sss: {
        label:      "State Statistics Service of Ukraine",
        country:    "Ukraine",
        key:        "",   // no key required — https://www.ukrstat.gov.ua/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Iceland ────────────────────────────────────────────────────────────
    isl_statice: {
        label:      "Statistics Iceland",
        country:    "Iceland",
        key:        "",   // no key required — https://px.hagstofa.is/pxen/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Serbia ─────────────────────────────────────────────────────────────
    srb_sors: {
        label:      "SORS (Serbia)",
        country:    "Serbia",
        key:        "",   // no key required — https://www.stat.gov.rs/en-us/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Croatia ────────────────────────────────────────────────────────────
    hrv_dzs: {
        label:      "DZS (Croatia)",
        country:    "Croatia",
        key:        "",   // no key required — https://www.dzs.hr/default_e.htm
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Slovakia ───────────────────────────────────────────────────────────
    svk_susr: {
        label:      "SUSR (Slovakia)",
        country:    "Slovakia",
        key:        "",   // no key required — https://slovak.statistics.sk/
        enabled:    false,
        categories: ['demographics', 'finance']
    },
};
