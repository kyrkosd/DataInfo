/* global SOURCES_GLOBAL, SOURCES_AMERICAS, SOURCES_EUROPE,
          SOURCES_ASIA, SOURCES_AFRICA, SOURCES_OCEANIA */

// ─── CONFIG — edit these values to change behaviour ───────────────────────────

const GEMINI_API_KEY = "";           // https://aistudio.google.com
const GEMINI_MODEL   = "gemini-2.5-flash";

// Autocorrect dictionary — applied word-by-word before the query is sent.
const AUTOCORRECT = {
    "amercans":   "americans",
    "amercan":    "american",
    "overwieght": "overweight",
    "statistcs":  "statistics",
    "percet":     "percent",
    "tecnology":  "technology",
    "erth":       "earth",
    "replce":     "replace"
};

// TOPIC_KEYWORDS — maps topic names to trigger keywords.
// detectTopics() scans the claim for these keywords to decide which APIs to call.
const TOPIC_KEYWORDS = {
    health:      ['health', 'disease', 'obesity', 'overweight', 'cancer', 'diabetes',
                  'mortality', 'death', 'hospital', 'medicine', 'drug', 'vaccine',
                  'infection', 'virus', 'mental', 'depression', 'suicide', 'nutrition',
                  'diet', 'smoking', 'alcohol', 'bmi', 'weight', 'heart', 'lung',
                  'covid', 'pandemic', 'epidemic', 'life expectancy', 'healthcare'],
    finance:     ['gdp', 'economy', 'economic', 'finance', 'financial', 'inflation',
                  'debt', 'deficit', 'trade', 'export', 'import', 'income', 'poverty',
                  'wealth', 'bank', 'stock', 'market', 'investment', 'tax', 'budget',
                  'fiscal', 'monetary', 'interest rate', 'currency', 'dollar', 'euro',
                  'recession', 'growth', 'cost of living', 'price', 'wages'],
    labor:       ['job', 'jobs', 'employment', 'unemployment', 'worker', 'workers',
                  'wage', 'salary', 'work', 'labor', 'labour', 'workforce', 'career',
                  'occupation', 'hire', 'fired', 'layoff', 'automation', 'replace',
                  'gig', 'remote', 'productivity', 'strike'],
    demographics:['population', 'demographic', 'birth', 'fertility', 'migration',
                  'immigrant', 'census', 'race', 'ethnicity', 'gender', 'american',
                  'americans', 'people', 'country', 'nation', 'household', 'age',
                  'elderly', 'children', 'youth', 'urban', 'rural'],
    environment: ['climate', 'environment', 'carbon', 'emission', 'pollution',
                  'temperature', 'warming', 'energy', 'renewable', 'fossil fuel',
                  'deforestation', 'biodiversity', 'species', 'ocean', 'water',
                  'plastic', 'waste', 'greenhouse', 'sea level'],
    energy:      ['electricity', 'oil', 'gas', 'coal', 'solar', 'wind', 'nuclear',
                  'barrel', 'kwh', 'megawatt', 'power plant', 'petroleum',
                  'gasoline', 'natural gas', 'grid', 'energy consumption',
                  'energy production', 'eia', 'opec', 'refinery']
};

// API_SOURCES — assembled from the continent source files loaded before this script.
// To enable a source: find it in src/sources/<continent>.js, set enabled: true,
// and paste its API key into the key field (if required).
const API_SOURCES = {
    ...SOURCES_GLOBAL,
    ...SOURCES_AMERICAS,
    ...SOURCES_EUROPE,
    ...SOURCES_ASIA,
    ...SOURCES_AFRICA,
    ...SOURCES_OCEANIA
};

window.GEMINI_API_KEY = GEMINI_API_KEY;
window.GEMINI_MODEL   = GEMINI_MODEL;
window.AUTOCORRECT    = AUTOCORRECT;
window.TOPIC_KEYWORDS = TOPIC_KEYWORDS;
window.API_SOURCES    = API_SOURCES;
