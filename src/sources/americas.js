// ─── SOURCES: AMERICAS ────────────────────────────────────────────────────────
// Official statistical sources for North America, Central America,
// South America, and the Caribbean.

const SOURCES_AMERICAS = {

    // ── United States ──────────────────────────────────────────────────────
    bls: {
        label:      "US Bureau of Labor Statistics",
        country:    "United States",
        key:        "",   // https://data.bls.gov/registrationEngine
        enabled:    false,
        categories: ['labor', 'finance']
    },
    census: {
        label:      "US Census Bureau",
        country:    "United States",
        key:        "",   // https://api.census.gov/data/key_signup.html
        enabled:    false,
        categories: ['demographics', 'labor', 'finance']
    },
    fred: {
        label:      "FRED / Federal Reserve",
        country:    "United States",
        key:        "",   // https://fred.stlouisfed.org/docs/api/api_key.html
        enabled:    false,
        categories: ['finance', 'labor']
    },
    cdc: {
        label:      "CDC Open Data",
        country:    "United States",
        key:        "",   // optional app token — https://dev.socrata.com/foundry/data.cdc.gov
        enabled:    false,
        categories: ['health']
    },
    eia: {
        label:      "EIA Energy Statistics",
        country:    "United States",
        key:        "",   // https://www.eia.gov/opendata/register.php
        enabled:    false,
        categories: ['energy', 'environment']
    },
    usa_epa: {
        label:      "US EPA Environmental Data",
        country:    "United States",
        key:        "",   // no key required — https://www.epa.gov/developers/data-data-products
        enabled:    false,
        categories: ['environment']
    },
    usa_usda: {
        label:      "USDA Economic Research Service",
        country:    "United States",
        key:        "",   // no key required — https://www.ers.usda.gov/developer/
        enabled:    false,
        categories: ['environment', 'finance']
    },
    usa_nih: {
        label:      "NIH Open Data",
        country:    "United States",
        key:        "",   // no key required — https://opendata.nih.gov/
        enabled:    false,
        categories: ['health']
    },

    // ── Canada ─────────────────────────────────────────────────────────────
    can_statcan: {
        label:      "Statistics Canada",
        country:    "Canada",
        key:        "",   // no key required — https://www.statcan.gc.ca/en/developers/cdsb/json-api
        enabled:    false,
        categories: ['demographics', 'finance', 'labor', 'health']
    },
    can_bankofcanada: {
        label:      "Bank of Canada",
        country:    "Canada",
        key:        "",   // no key required — https://www.bankofcanada.ca/valet/docs
        enabled:    false,
        categories: ['finance']
    },

    // ── Brazil ─────────────────────────────────────────────────────────────
    bra_ibge: {
        label:      "IBGE (Brazil)",
        country:    "Brazil",
        key:        "",   // no key required — https://apisidra.ibge.gov.br/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    bra_bcb: {
        label:      "Banco Central do Brasil",
        country:    "Brazil",
        key:        "",   // no key required — https://dadosabertos.bcb.gov.br/
        enabled:    false,
        categories: ['finance']
    },

    // ── Mexico ─────────────────────────────────────────────────────────────
    mex_inegi: {
        label:      "INEGI (Mexico)",
        country:    "Mexico",
        key:        "",   // https://www.inegi.org.mx/servicios/api_indicadores.html
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
    mex_banxico: {
        label:      "Banco de México",
        country:    "Mexico",
        key:        "",   // https://www.banxico.org.mx/SieAPIRest/service/v1/token
        enabled:    false,
        categories: ['finance']
    },

    // ── Chile ──────────────────────────────────────────────────────────────
    chl_ine: {
        label:      "INE Chile",
        country:    "Chile",
        key:        "",   // no key required — https://www.ine.gob.cl/herramientas/portal-de-mapas/developers
        enabled:    false,
        categories: ['demographics', 'labor', 'finance']
    },
    chl_bcentral: {
        label:      "Banco Central de Chile",
        country:    "Chile",
        key:        "",   // https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/index.html
        enabled:    false,
        categories: ['finance']
    },

    // ── Colombia ───────────────────────────────────────────────────────────
    col_dane: {
        label:      "DANE (Colombia)",
        country:    "Colombia",
        key:        "",   // no key required — https://www.dane.gov.co/index.php/servicios-al-ciudadano/servicios-informacion/api
        enabled:    false,
        categories: ['demographics', 'labor', 'finance']
    },

    // ── Argentina ──────────────────────────────────────────────────────────
    arg_indec: {
        label:      "INDEC (Argentina)",
        country:    "Argentina",
        key:        "",   // no key required — https://apis.datos.gob.ar/series/api/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Peru ───────────────────────────────────────────────────────────────
    per_inei: {
        label:      "INEI (Peru)",
        country:    "Peru",
        key:        "",   // no key required — https://www.inei.gob.pe/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Venezuela ──────────────────────────────────────────────────────────
    ven_ine: {
        label:      "INE (Venezuela)",
        country:    "Venezuela",
        key:        "",   // no key required — https://www.ine.gov.ve/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Ecuador ────────────────────────────────────────────────────────────
    ecu_inec: {
        label:      "INEC (Ecuador)",
        country:    "Ecuador",
        key:        "",   // no key required — https://www.ecuadorencifras.gob.ec/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Bolivia ────────────────────────────────────────────────────────────
    bol_ine: {
        label:      "INE (Bolivia)",
        country:    "Bolivia",
        key:        "",   // no key required — https://www.ine.gob.bo/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Uruguay ────────────────────────────────────────────────────────────
    ury_ine: {
        label:      "INE (Uruguay)",
        country:    "Uruguay",
        key:        "",   // no key required — https://www.gub.uy/instituto-nacional-estadistica/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },

    // ── Paraguay ───────────────────────────────────────────────────────────
    pry_dgeec: {
        label:      "DGEEC (Paraguay)",
        country:    "Paraguay",
        key:        "",   // no key required — https://www.dgeec.gov.py/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Cuba ───────────────────────────────────────────────────────────────
    cub_onei: {
        label:      "ONEI (Cuba)",
        country:    "Cuba",
        key:        "",   // no key required — https://www.onei.gob.cu/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Dominican Republic ─────────────────────────────────────────────────
    dom_one: {
        label:      "ONE (Dominican Republic)",
        country:    "Dominican Republic",
        key:        "",   // no key required — https://one.gob.do/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Guatemala ──────────────────────────────────────────────────────────
    gtm_ine: {
        label:      "INE (Guatemala)",
        country:    "Guatemala",
        key:        "",   // no key required — https://www.ine.gob.gt/
        enabled:    false,
        categories: ['demographics', 'finance']
    },

    // ── Costa Rica ─────────────────────────────────────────────────────────
    cri_inec: {
        label:      "INEC (Costa Rica)",
        country:    "Costa Rica",
        key:        "",   // no key required — https://www.inec.cr/
        enabled:    false,
        categories: ['demographics', 'finance', 'labor']
    },
};
