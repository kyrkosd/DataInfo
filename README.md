# DataInfo — Statistical Claim Validator

A browser-only tool that verifies statistical claims against official data sources. Enter a claim in plain English, get a sourced verdict backed by real data from institutional APIs.

**No backend. No login. No hallucination from general web crawling.**

---

## What It Does

DataInfo takes a claim like *"67% of Americans are overweight"* and:

1. Detects the topic (health, finance, labor, demographics, environment)
2. Queries only the relevant official databases in parallel
3. Feeds the raw data — and nothing else — to Gemini as context
4. Returns a structured verdict with cited sources, confidence level, and reasoning

The LLM acts as an analyst, not a search engine. It only sees what the tool explicitly fetches from whitelisted official APIs.

---

## Features

- **Official Sources mode** — RAG pipeline: Gemini receives only data fetched from official APIs, no web access
- **Web Search mode** — Google Search grounding enabled: Gemini searches the live web for broader context
- **Topic-based routing** — only queries sources relevant to the claim's topic, reducing noise
- **Preprocessing** — a fast Gemini pre-call extracts structured intent (topic, geography, time period) and generates optimized search terms per API before any data is fetched
- **Metric disambiguation** — shows the exact metric definition used and lists alternative definitions that could yield a different result
- **Data vintage** — shows the year of the data used ("Data as of: 2023") and flags preliminary data
- **Challenge classification** — classifies what made the claim hardest to verify (Numerical Reasoning, Multi-hop Reasoning, Entity Disambiguation, etc.)
- **Confidence scoring** — high / medium / low based on how directly the data addresses the claim
- **Reasoning steps** — collapsible audit trail of the logical steps Gemini took to reach the verdict
- **Evidence type labeling** — each data source passed to Gemini is tagged by type (Research Abstract, Statistical Indicator, etc.)
- **Autocorrect** — common typos corrected before sending the query
- **Exponential backoff** — automatic retry on 429 / 5xx errors

---

## Setup

DataInfo is a static site. No build step, no server, no npm install.

### 1. Get a Gemini API key

Go to [aistudio.google.com](https://aistudio.google.com), create a free API key.

### 2. Add the key to the project

Open `src/config.js` and paste your key:

```js
const GEMINI_API_KEY = "your-key-here";
```

### 3. Open the site

Open `index.html` directly in a browser, or serve it with any static file server:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

That's it. No `.env` files, no build tools, no dependencies to install.

> The `.env` file is gitignored. If you prefer to keep the key out of `src/config.js`, you can store it in `.env` and load it manually — but since there is no backend, the key will always be visible in the browser regardless of where it is stored. For production use, move API calls to a server-side function.

---

## Project Structure

```
DataInfo/
├── index.html          # HTML shell — structure only, no logic
├── styles.css          # All CSS (status colours, loader, tab styles)
├── src/
│   ├── config.js       # API keys, model name, autocorrect, topic keywords, source registry
│   ├── utils.js        # DOM helpers, applyAutocorrect(), detectTopics(), fetchWithBackoff()
│   ├── api.js          # Official API query functions (PubMed, World Bank, WHO, BLS stub, Census stub)
│   ├── analyze.js      # Core logic: preprocessClaim(), analyzeClaim(), analyzeClaimWeb()
│   └── ui.js           # displayResult(), showError(), switchTab(), submit(), event listeners
├── DOCS.md             # Deep technical documentation
├── README.md           # This file
└── .env                # (gitignored) optional key storage
```

Scripts are loaded in dependency order: `config → utils → api → analyze → ui`. All files use vanilla globals — no ES modules, so the tool works when opened as a local `file://` URL.

---

## How It Works

### Official Sources tab (RAG mode)

```
User submits claim
        │
        ▼
1. Autocorrect
   Typos corrected word-by-word against AUTOCORRECT dictionary

        │
        ▼
2. Preprocessing  [Gemini call #1]
   Fast call extracts: topic, geography, time_period, metric
   Also generates optimized search strings per API (pubmed / worldbank / who)

        │
        ▼
3. Topic detection
   If preprocessing returned a topic → use it
   Else → scan claim text for keywords in TOPIC_KEYWORDS → Set of topics
   Empty set → fall back to all enabled sources

        │
        ▼
4. Source selection
   Filter API_SOURCES where enabled=true AND categories ∩ topics ≠ ∅

        │
        ▼
5. Parallel API calls  (Promise.all)
   Each function returns { label, url, data, date, evidence_type } or null
   Nulls filtered out. If nothing remains → display "No Official Data" immediately

        │
        ▼
6. Context assembly
   Each result tagged: "=== PubMed / NCBI [Research Abstract] ===\n..."
   Joined into a single text block injected into the Gemini prompt

        │
        ▼
7. RAG call  [Gemini call #2, no googleSearch tool]
   Strict prompt: use ONLY the data above, do not hallucinate
   Returns JSON: status, title, text, metric_used, alternatives,
                 data_vintage, challenge_type, reasoning_steps, confidence

        │
        ▼
8. Display
   Result card rendered with verdict, badge, sources, metric info,
   challenge badge, confidence badge, collapsible reasoning steps
```

### Web Search tab

Same flow but step 5 is skipped. A single Gemini call with `tools: [{ googleSearch: {} }]` enabled fetches live web results. Sources are extracted from `groundingMetadata.groundingChunks` in the response.

---

## Data Sources

| Source | Coverage | Key required |
|---|---|---|
| **PubMed / NCBI** | Peer-reviewed biomedical research, health statistics | Optional (free, higher rate limit) |
| **World Bank Open Data** | GDP, poverty, trade, environment, demographics — 200+ countries | No |
| **WHO Global Health Observatory** | Global health indicators, disease burden, mortality | No |
| **Bureau of Labor Statistics** | US unemployment, wages, CPI | Free — disabled pending implementation |
| **US Census Bureau** | US population, income, housing | Free — disabled pending implementation |

### Topic → Source routing

| Detected topic | Sources queried |
|---|---|
| `health` | PubMed, WHO |
| `finance` | World Bank |
| `labor` | World Bank |
| `demographics` | World Bank, WHO |
| `environment` | World Bank |
| `health` + `demographics` | PubMed, World Bank, WHO |
| *(no match)* | All enabled sources |

---

## Result Card

Each result contains:

| Field | Description |
|---|---|
| **Verdict badge** | VERIFIED / UPDATED CONTEXT / UNVERIFIED-FALSE / NO OFFICIAL DATA |
| **Title + explanation** | Short title and a detailed paragraph citing specific numbers |
| **Challenge type** | What made the claim hard to verify (purple badge) |
| **Confidence** | High / Medium / Low — how directly the data addresses the claim (green/amber/rose badge) |
| **Reasoning Steps** | Collapsible list of 2–4 logical steps Gemini took to reach the verdict |
| **Metric used** | The exact definition used (e.g. "U-3 unemployment rate, seasonally adjusted") |
| **Alternative definitions** | Other metrics that could give a different result |
| **Data as of** | Most recent data year used, with "(preliminary)" if applicable |
| **Sources** | Clickable links to the official databases queried |

### Verdict colours

| Status | Colour | Meaning |
|---|---|---|
| `true` | Green | Official data confirms the claim |
| `partial` | Amber | Data partially supports it, or the numbers differ |
| `false` | Red | Data clearly contradicts the claim |
| `no_data` | Grey | No relevant data found in the queried sources |

### Challenge types (FEVEROUS taxonomy)

| Type | When assigned |
|---|---|
| Numerical Reasoning | Claim requires a calculation or comparison of numbers |
| Multi-hop Reasoning | Verdict requires combining evidence across multiple sources |
| Entity Disambiguation | The claim's subject matches multiple metrics or definitions |
| Combining Tables and Text | Evidence spans both structured data and narrative text |
| Insufficient Data | Sources exist but don't directly address the claim |
| None | Data directly and unambiguously supports or refutes the claim |

---

## Configuration

All settings live in `src/config.js`.

### GEMINI_MODEL

Default: `gemini-2.5-flash`. Switch to `gemini-2.5-pro` for more thorough analysis at higher cost.

### AUTOCORRECT

Add entries to fix domain-specific typos before they reach the API:

```js
const AUTOCORRECT = {
    "overwieght": "overweight",
    "amercans":   "americans",
    // add more here
};
```

### TOPIC_KEYWORDS

Add keywords to widen topic detection, or add a new topic key:

```js
const TOPIC_KEYWORDS = {
    // existing topics...
    science: ['physics', 'chemistry', 'quantum', 'genetics', 'nasa', 'cern']
};
```

### API_SOURCES

Enable a disabled source by adding a key and flipping `enabled`:

```js
bls: {
    label:      "Bureau of Labor Statistics",
    key:        "your-bls-key",
    enabled:    true,
    categories: ['labor', 'finance']
}
```

---

## Extending the Tool

### Add a new data source

1. Write a query function in `src/api.js` that returns `{ label, url, data, date }` or `null`
2. Register it in `API_SOURCES` in `src/config.js` with the appropriate `categories`
3. Add a dispatch case in the `fetches` map inside `analyzeClaim()` in `src/analyze.js`

### Add a new topic category

1. Add a keyword list to `TOPIC_KEYWORDS` in `src/config.js`
2. Add the new topic name to the `categories` array of the relevant source(s)

See `DOCS.md` for worked examples of both.

---

## Limitations

| Limitation | Detail |
|---|---|
| API key visible in browser | No backend means the Gemini key is always accessible in DevTools. Fine for personal use; move to a server for any public deployment. |
| BLS and Census not implemented | Both require topic-specific series/variable codes that can't be derived from free text. Lookup tables are needed. |
| World Bank indicator matching is approximate | Keyword search on indicator names; a tangentially related indicator can be returned. |
| WHO keyword truncation | The GHO OData `contains()` filter is truncated to the first 3 words of the search term. |
| PubMed returns abstracts only | Full paper text requires institutional access. The specific statistic may not appear in the abstract. |
| No date filtering | The tool fetches the most recent data but does not filter by a year explicitly stated in the claim. |
| English only | Topic keywords and autocorrect cover English only. |

---

## Tech Stack

- **HTML / CSS / Vanilla JS** — no framework, no build step
- **Tailwind CSS** — via CDN
- **Gemini 2.5 Flash** — via Google AI Studio API
- **PubMed NCBI E-utilities**, **World Bank Open Data API**, **WHO GHO OData API** — no keys required for basic use

---

For deep technical documentation — data flow diagrams, function contracts, step-by-step source addition guides, and the full progress log — see [`DOCS.md`](DOCS.md).
