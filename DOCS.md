# DataInfo — Documentation

This is the first documentation of the project.

Statistical claim validator that queries official databases and uses an LLM to produce a sourced verdict.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Data Flow](#3-data-flow)
4. [Configuration Reference](#4-configuration-reference)
5. [Sources Reference](#5-sources-reference)
6. [Topic Routing System](#6-topic-routing-system)
7. [Status Types](#7-status-types)
8. [How to Add a New Source](#8-how-to-add-a-new-source)
9. [How to Add a New Topic Category](#9-how-to-add-a-new-topic-category)
10. [Progress Log](#10-progress-log)
11. [Known Limitations](#11-known-limitations)
12. [Planned Next Steps](#12-planned-next-steps)

---

## 1. Project Overview

**DataInfo** validates statistical claims against official data sources. The user enters a claim in plain English, the tool fetches real data from institutional APIs, and an LLM produces a structured verdict (true / partial / false / no official data) with cited sources.

**Key design principle:** The LLM never searches the web. It only sees the data the tool explicitly fetches from whitelisted official APIs. This eliminates hallucination from general web crawling.

**Stack:**
- Single HTML file (`index.html`) — no build step, no server, no framework
- Tailwind CSS (CDN) for styling
- Vanilla JavaScript (ES2020) for all logic
- Gemini 2.5 Flash for claim analysis
- Public REST APIs for official data

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│                                                             │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │   index.html │    │           JavaScript              │  │
│  │              │    │                                   │  │
│  │  - Search UI │◄───│  1. applyAutocorrect()            │  │
│  │  - Result    │    │  2. detectTopics()                │  │
│  │    card      │    │  3. queryPubMed()   ─────────────►│──┼──► NCBI E-utilities API
│  │  - Guide     │    │     queryWorldBank()─────────────►│──┼──► World Bank API
│  │    modal     │    │     queryWHO()      ─────────────►│──┼──► WHO GHO API
│  └──────────────┘    │  4. analyzeClaim()  ─────────────►│──┼──► Gemini API
│                       │  5. displayResult()               │  │
│                       └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

All API calls are made directly from the browser. There is no backend server.

---

## 3. Data Flow

This is the exact sequence of events when a user submits a claim:

```
User types claim → clicks "Analyze Claim" (or presses Enter)
        │
        ▼
1. applyAutocorrect(query)
   └─ Checks each word against the AUTOCORRECT dictionary
   └─ If any word was corrected, updates the input and shows a notice
   └─ Returns the (possibly corrected) query string
        │
        ▼
2. detectTopics(query)
   └─ Lowercases the query
   └─ Checks for keyword substrings from TOPIC_KEYWORDS
   └─ Returns a Set of matched topic names (e.g. {'health', 'demographics'})
   └─ Empty Set if nothing matched → fall back to all enabled sources
        │
        ▼
3. Source selection
   └─ Filters API_SOURCES to entries where:
       • enabled === true
       • categories array overlaps with detected topics
         (or all enabled sources if topics is empty)
   └─ Updates loading message: "Querying PubMed / NCBI, WHO..."
        │
        ▼
4. Parallel API calls  (Promise.all — all selected sources queried simultaneously)
   ├─ queryPubMed()    → NCBI E-utilities (esearch → efetch, plain-text abstracts)
   ├─ queryWorldBank() → World Bank API  (indicator search → indicator data)
   └─ queryWHO()       → WHO GHO OData   (indicator search → recent data points)
   └─ All return { label, url, data } or null on failure
   └─ Nulls are filtered out; if nothing remains → display "No Official Data" immediately
        │
        ▼
5. Context assembly
   └─ Joins all returned data blocks into a single labelled text string:
       "=== PubMed / NCBI ===\n<abstracts>\n\n=== World Bank ===\n<data>\n..."
        │
        ▼
6. Gemini API call  (no Google Search tool — strictly RAG)
   └─ Sends the context + claim in a strict prompt
   └─ Prompt instructs Gemini: use ONLY the data provided, do not hallucinate
   └─ Expects a JSON response: { status, title, text }
        │
        ▼
7. Response parsing
   └─ Strips any ```json ... ``` markdown wrapper Gemini may add
   └─ JSON.parse() the response
   └─ Attaches source metadata from our results array (not from Gemini grounding)
        │
        ▼
8. displayResult(data)
   └─ Looks up the status in the STYLES table
   └─ Applies status class to the result card (sets border + background colour)
   └─ Populates title, badge, explanation text, and clickable source links
```

---

## 4. Configuration Reference

All configurable values are at the top of the `<script>` block in `index.html`.

### GEMINI_API_KEY
```js
const GEMINI_API_KEY = "";
```
Your Google Gemini API key. Get one at [aistudio.google.com](https://aistudio.google.com).
The tool will show an error card if this is empty when a claim is submitted.

### GEMINI_MODEL
```js
const GEMINI_MODEL = "gemini-2.5-flash";
```
The Gemini model to use. `gemini-2.5-flash` is the default — fast and cost-efficient.
You can switch to `gemini-2.5-pro` for more thorough analysis at higher cost.
Note: Gemini 1.5 Flash (`gemini-1.5-flash-001`) is the only Gemini model that supports fine-tuning.

### AUTOCORRECT
```js
const AUTOCORRECT = {
    "overwieght": "overweight",
    ...
};
```
Word-by-word typo correction applied before the query is sent. Keys are misspelled words (lowercase, no punctuation). Values are the corrected replacements. Add entries to cover domain-specific typos.

### TOPIC_KEYWORDS
See [Section 6](#6-topic-routing-system).

### API_SOURCES
See [Section 5](#5-sources-reference).

---

## 5. Sources Reference

| Key | Label | Key Required | Default | Categories |
|---|---|---|---|---|
| `pubmed` | PubMed / NCBI | Optional (higher rate limit) | Enabled | `health` |
| `worldbank` | World Bank Open Data | None | Enabled | `finance`, `demographics`, `environment`, `labor` |
| `who` | WHO Global Health Observatory | None | Enabled | `health`, `demographics` |
| `bls` | Bureau of Labor Statistics | Free — [data.bls.gov/registrationEngine](https://data.bls.gov/registrationEngine) | Disabled | `labor`, `finance` |
| `census` | US Census Bureau | Free — [api.census.gov/data/key_signup.html](https://api.census.gov/data/key_signup.html) | Disabled | `demographics`, `labor`, `finance` |

### Enabling a disabled source

1. Register for a free API key at the URL in the table above.
2. In `index.html`, find the source entry in `API_SOURCES`.
3. Paste the key into the `key` field.
4. Change `enabled: false` to `enabled: true`.

### Source details

**PubMed / NCBI** (`queryPubMed`)
- API: NCBI E-utilities (`eutils.ncbi.nlm.nih.gov`)
- Method: Two-step — `esearch` to find article IDs, then `efetch` to get plain-text abstracts
- Rate limit: 3 requests/second without a key; 10/second with a free key
- Best for: health claims, medical statistics, disease prevalence, clinical findings

**World Bank Open Data** (`queryWorldBank`)
- API: `api.worldbank.org/v2`
- Method: Two-step — indicator keyword search, then fetch latest values per country
- Rate limit: generous, no key required
- Best for: GDP, poverty rates, life expectancy, trade data, environmental indicators

**WHO Global Health Observatory** (`queryWHO`)
- API: `ghoapi.azureedge.net/api` (OData)
- Method: Two-step — indicator name search (first 3 words), then fetch recent data points
- Rate limit: generous, no key required
- Best for: global health statistics, mortality, disease burden, vaccination coverage

**Bureau of Labor Statistics** (`queryBLS`) — *not yet implemented*
- API: `api.bls.gov/publicAPI/v2`
- Limitation: BLS requires specific series IDs; no free-text search endpoint exists
- When implemented: best for US unemployment, wages, CPI, job openings

**US Census Bureau** (`queryCensus`) — *not yet implemented*
- API: `api.census.gov`
- Limitation: requires specific dataset codes and variable names
- When implemented: best for US population, income, housing, demographic breakdowns

---

## 6. Topic Routing System

The routing system ensures only relevant sources are queried, reducing unnecessary API calls and noise in the Gemini context.

### How it works

`detectTopics(query)` performs a **case-insensitive substring match** of the user's query against keyword lists in `TOPIC_KEYWORDS`. It returns a `Set` of matched topic names.

Each source in `API_SOURCES` has a `categories` array. A source is queried only if at least one of its categories is in the detected topics set.

**Fallback:** If no keywords match (e.g. "earth is flat"), the topics Set is empty and all enabled sources are queried.

### Topic → Source mapping

| Topic detected | Sources queried |
|---|---|
| `health` | PubMed, WHO |
| `finance` | World Bank *(+ BLS, Census when enabled)* |
| `labor` | World Bank *(+ BLS, Census when enabled)* |
| `demographics` | World Bank, WHO *(+ Census when enabled)* |
| `environment` | World Bank |
| `health` + `demographics` | PubMed, World Bank, WHO |
| *(none)* | All enabled sources |

### Example routing

| Claim | Topics detected | Sources called |
|---|---|---|
| "67% of Americans are overweight" | `health`, `demographics` | PubMed, World Bank, WHO |
| "US GDP grew 2.5% last year" | `finance` | World Bank |
| "Unemployment is at 4% in the US" | `labor`, `finance` | World Bank |
| "CO2 emissions rose 10% since 2020" | `environment` | World Bank |
| "The earth is flat" | *(none)* | All enabled sources |

---

## 7. Status Types

Gemini returns one of four status values. The UI maps each to a colour, badge label, and border style.

| Status | Colour | Badge | Meaning |
|---|---|---|---|
| `true` | Green | VERIFIED | The official data confirms the claim |
| `partial` | Amber | UPDATED CONTEXT | The data partially supports the claim, or the numbers differ from the claim |
| `false` | Red | UNVERIFIED / FALSE | The data clearly contradicts the claim |
| `no_data` | Grey | NO OFFICIAL DATA | The queried sources returned no data relevant to verifying the claim |

The `no_data` status is set either by:
- The JavaScript layer — when all API calls returned null (before even calling Gemini)
- Gemini — when the injected data exists but is unrelated to the specific claim

---

## 8. How to Add a New Source

Example: adding the OECD Stats API.

**Step 1 — Write the query function** (in `index.html`, after `queryCensus`):
```js
async function queryOECD(query) {
    try {
        // OECD SDMX-JSON API example
        const res = await fetch(`https://stats.oecd.org/SDMX-JSON/data/...`);
        if (!res.ok) return null;
        const data = await res.json();
        // ... extract and format relevant data ...
        return {
            label: 'OECD Statistics',
            url:   'https://stats.oecd.org',
            data:  '...'  // plain-text summary for Gemini
        };
    } catch { return null; }
}
```

**Step 2 — Register it in `API_SOURCES`**:
```js
oecd: {
    label:      "OECD Statistics",
    key:        "",         // add key if required
    enabled:    true,
    categories: ['finance', 'labor', 'demographics', 'environment']
}
```

**Step 3 — Add a dispatch case in `analyzeClaim()`**:
```js
const fetches = selected.map(([key, src]) => {
    if (key === 'pubmed')    return queryPubMed(query, src.key);
    if (key === 'worldbank') return queryWorldBank(query);
    if (key === 'who')       return queryWHO(query);
    if (key === 'oecd')      return queryOECD(query);    // ← add this
    ...
});
```

**Step 4 — Add topic keywords** if the source covers topics not yet in `TOPIC_KEYWORDS` (see Section 9).

---

## 9. How to Add a New Topic Category

Example: adding a `science` topic to route physics/chemistry claims to a new source.

**Step 1 — Add a keyword list to `TOPIC_KEYWORDS`**:
```js
const TOPIC_KEYWORDS = {
    // ... existing topics ...
    science: ['physics', 'chemistry', 'quantum', 'particle', 'nuclear',
               'biology', 'evolution', 'genetics', 'dna', 'atom',
               'space', 'planet', 'galaxy', 'nasa', 'cern']
};
```

**Step 2 — Add the topic to the relevant source's `categories`**:
```js
pubmed: {
    // ...
    categories: ['health', 'science']  // ← added 'science'
}
```

That is all — `detectTopics()` will now match the new topic and the source will be included in queries that contain those keywords.

---

## 10. Progress Log

A chronological record of all changes made to the project.

### Phase 1 — Initial cleanup
- **Removed** `Trending Official Statistics` section from the UI (hardcoded mock data)
- **Updated** the logo: replaced the blue `S` box with a stone-grey `DI` monogram
- **Merged** `frontend.html` (which had autocorrect + mock responses) into `index.html` (which had the real Gemini API call), producing a single centralised UI file
- **Deleted** `frontend.html` after merge

### Phase 2 — Dependency cleanup
- **Stripped** `package.json` from ~38 to 8 dependencies (kept only core React + Tailwind + Lucide)
- **Reduced** `src/components/ui/` from 45 shadcn components to 4 (badge, button, card, textarea)
- **Deleted** unused files: `statisticalAuditor.js`, `dataIngestion.js`, `playwright.config.js`, `NavLink.tsx`, `ClaimInput.tsx`, `VerdictCard.tsx`, `use-mobile.ts`, and 41 unused UI component files

### Phase 3 — Official sources restriction (prompt-level)
- **Replaced** the general Gemini prompt with a sources-restricted prompt
- **Added** `SOURCES` array to the CONFIG block — a list of 25 trusted domains (who.int, cdc.gov, worldbank.org, etc.)
- **Added** `no_data` as a fourth status value in the prompt JSON schema
- **Added** `.status-no_data` CSS class (grey styling)
- **Added** `no_data` entry to the `STYLES` lookup in `displayResult()`
- **Limitation at this stage:** restriction was prompt-level only — Gemini's Google Search grounding still accessed the open web; the domain list was an instruction, not a technical filter

### Phase 4 — Direct API method (hard restriction)
- **Replaced** the prompt-level `SOURCES` list with direct API calls to official databases
- **Added** three query functions: `queryPubMed()`, `queryWorldBank()`, `queryWHO()`
- **Removed** `tools: [{ googleSearch: {} }]` from the Gemini API call — Gemini can no longer search the web at all
- **Changed** data flow: Gemini now only receives data the tool explicitly fetched from official APIs
- **Added** `API_SOURCES` config object with `label`, `key`, `enabled`, and `categories` fields
- **Added** two placeholder functions: `queryBLS()` and `queryCensus()` (disabled, pending key/implementation)
- **Redesigned** loading message to show exactly which databases are being queried

### Phase 5 — Topic-based source routing
- **Added** `TOPIC_KEYWORDS` map with five topic categories: `health`, `finance`, `labor`, `demographics`, `environment`
- **Added** `detectTopics()` function — keyword substring matching, returns a `Set`
- **Added** `categories` arrays to each entry in `API_SOURCES`
- **Updated** `analyzeClaim()` to filter sources by detected topics before querying
- **Result:** a finance claim no longer queries WHO; a health claim no longer queries World Bank; unrecognised claims fall back to all enabled sources

### Phase 6 — Documentation and inline comments (current)
- **Added** comprehensive inline comments throughout `index.html`:
  - File-level architecture overview block
  - CSS status class documentation
  - Explanation of each CONFIG variable
  - Docblock comments for all functions
  - Step-by-step comments inside `analyzeClaim()`
- **Created** this `DOCS.md` file

---

## 11. Known Limitations

| Limitation | Detail |
|---|---|
| **BLS and Census not implemented** | Both APIs require topic-specific series/table IDs that can't be derived from a free-text query. A lookup table mapping topics to IDs is needed. |
| **World Bank indicator matching is approximate** | The World Bank API searches indicator names, not the data itself. A finance claim may match a tangentially related indicator. |
| **WHO keyword truncation** | The WHO GHO OData `contains()` filter works poorly with long strings, so the query is truncated to the first 3 words. Short/ambiguous queries may miss relevant indicators. |
| **PubMed returns abstracts only** | Full paper content requires institutional access. Abstracts may not contain the specific statistic needed to verify a claim. |
| **No date filtering** | The tool fetches the most recent available data but does not filter by the year a claim refers to (e.g. "in 2015…"). |
| **English only** | TOPIC_KEYWORDS and AUTOCORRECT are English-only. Non-English claims will likely fall back to the all-sources query. |
| **Prompt-level RAG only** | The current approach is a basic prompt-injection RAG. A production system would use a vector database with semantic search for more precise retrieval. |
| **Single-file prototype** | All logic lives in one HTML file. For production, the API query functions should move to a backend to protect API keys and handle CORS properly. |

---

## 12. Planned Next Steps

In rough priority order:

1. **Implement BLS query function** — build a series-ID lookup table for common labor topics (unemployment, wages, CPI) and wire it into `queryBLS()`
2. **Implement Census query function** — map demographic topics to specific Census API dataset/variable codes
3. **Add date-aware querying** — extract year references from the claim and pass them as filters to the World Bank and WHO APIs
4. **Add OECD as a source** — strong coverage for international economic and social statistics
5. **Fine-tune the LLM** — use `gemini-1.5-flash-001` (the only fine-tuneable Gemini model) with curated claim/verdict pairs to improve JSON reliability and citation quality
6. **Move API calls to a backend** — Node.js or Python server to protect keys and handle any CORS restrictions
7. **Add semantic topic detection** — replace keyword substring matching with a lightweight embedding-based classifier for more accurate routing on ambiguous claims
8. **Vector database integration** — store ingested official reports as embeddings for semantic retrieval, enabling coverage of sources without REST APIs
