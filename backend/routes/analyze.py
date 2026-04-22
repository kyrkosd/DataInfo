"""Analyze endpoints — proxies claim verification to Gemini and official APIs."""
import os
import asyncio
import json
import re
from urllib.parse import quote
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import httpx
from db import supabase

router = APIRouter()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_URL     = (
    "https://generativelanguage.googleapis.com/v1beta/models"
    f"/{GEMINI_MODEL}:generateContent"
)
PUBMED_API_KEY = os.environ.get("PUBMED_API_KEY", "")

TOPIC_KEYWORDS = {
    "health": [
        "health", "disease", "obesity", "overweight", "cancer", "diabetes",
        "mortality", "death", "hospital", "medicine", "drug", "vaccine",
        "infection", "virus", "mental", "depression", "suicide", "nutrition",
        "diet", "smoking", "alcohol", "bmi", "weight", "heart", "lung",
        "covid", "pandemic", "epidemic", "life expectancy", "healthcare",
    ],
    "finance": [
        "gdp", "economy", "economic", "finance", "financial", "inflation",
        "debt", "deficit", "trade", "export", "import", "income", "poverty",
        "wealth", "bank", "stock", "market", "investment", "tax", "budget",
        "fiscal", "monetary", "interest rate", "currency", "dollar", "euro",
        "recession", "growth", "cost of living", "price", "wages",
    ],
    "labor": [
        "job", "jobs", "employment", "unemployment", "worker", "workers",
        "wage", "salary", "work", "labor", "labour", "workforce", "career",
        "occupation", "hire", "fired", "layoff", "automation", "replace",
        "gig", "remote", "productivity", "strike",
    ],
    "demographics": [
        "population", "demographic", "birth", "fertility", "migration",
        "immigrant", "census", "race", "ethnicity", "gender", "american",
        "americans", "people", "country", "nation", "household", "age",
        "elderly", "children", "youth", "urban", "rural",
    ],
    "environment": [
        "climate", "environment", "carbon", "emission", "pollution",
        "temperature", "warming", "energy", "renewable", "fossil fuel",
        "deforestation", "biodiversity", "species", "ocean", "water",
        "plastic", "waste", "greenhouse", "sea level",
    ],
    "energy": [
        "electricity", "oil", "gas", "coal", "solar", "wind", "nuclear",
        "barrel", "kwh", "megawatt", "power plant", "petroleum",
        "gasoline", "natural gas", "grid", "energy consumption",
        "energy production", "eia", "opec", "refinery",
    ],
}

API_SOURCES = {
    "pubmed": {
        "label":      "PubMed / NCBI",
        "categories": ["health"],
        "enabled":    True,
    },
    "who": {
        "label":      "WHO Global Health Observatory",
        "categories": ["health", "demographics"],
        "enabled":    True,
    },
    "worldbank": {
        "label":      "World Bank Open Data",
        "categories": ["finance", "demographics", "environment", "labor"],
        "enabled":    True,
    },
}

EVIDENCE_TYPES = {
    "pubmed":    "Research Abstract",
    "who":       "Statistical Indicator",
    "worldbank": "Statistical Indicator",
}


# ── Pydantic models ───────────────────────────────────────────────────────────

class ClaimRequest(BaseModel):
    """Request body for both analyze endpoints."""

    query: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def log_search(
    token: Optional[str], query: str, tab: str, result_status: str
) -> None:
    """Log a completed search to Supabase; silently skips if no auth token."""
    if not supabase or not token:
        return
    try:
        jwt  = token.removeprefix("Bearer ").strip()
        user = supabase.auth.get_user(jwt)
        uid  = user.user.id
        supabase.table("searches").insert({
            "user_id": uid, "query": query,
            "tab": tab, "result_status": result_status,
        }).execute()
        supabase.table("activity_log").insert({
            "user_id": uid, "action": "search",
            "metadata": {"tab": tab, "status": result_status},
        }).execute()
    except Exception:  # never block the response if logging fails
        pass


def detect_topics(query: str) -> set:
    """Return the set of topic names whose keywords appear in the query."""
    q       = query.lower()
    matched = set()
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            matched.add(topic)
    return matched


async def gemini_post(client: httpx.AsyncClient, payload: dict) -> dict:
    """POST a payload to Gemini and return the parsed JSON response."""
    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
    r   = await client.post(url, json=payload, timeout=30)
    r.raise_for_status()
    return r.json()


async def preprocess_claim(
    client: httpx.AsyncClient, query: str
) -> Optional[dict]:
    """Extract structured intent (topic, geography, search terms) from the claim."""
    if not GEMINI_API_KEY:
        return None
    prompt = (
        "Extract structured intent from this statistical claim. "
        "Respond with a valid JSON object only — no markdown, no extra text.\n\n"
        f'CLAIM: "{query}"\n\n'
        "{{\n"
        '  "topic": "health | finance | labor | demographics | environment | general",\n'
        '  "geography": "country or region name, or \'global\' if not specified",\n'
        '  "time_period": "specific year or range, or \'latest\' if not specified",\n'
        '  "metric": "the specific statistic being claimed in plain English",\n'
        '  "search_terms": {{\n'
        '    "pubmed": "optimized 3-5 word medical/scientific search string",\n'
        '    "worldbank": "optimized 3-5 word World Bank indicator search string",\n'
        '    "who": "optimized 2-3 word WHO indicator search string (strict limit)"\n'
        "  }}\n"
        "}}"
    )
    try:
        data = await gemini_post(
            client, {"contents": [{"parts": [{"text": prompt}]}]}
        )
        raw = data["candidates"][0]["content"]["parts"][0]["text"]
        raw = re.sub(r"```json\n?|```", "", raw).strip()
        return json.loads(raw)
    except Exception:
        return None


def _build_official_prompt(
    context: str, geo_ctx: str, time_ctx: str, query: str
) -> str:
    """Build the Gemini prompt for official-sources fact-checking."""
    return (
        "You are a strict statistical fact-checker.\n\n"
        "Below is data retrieved directly from official sources. "
        "Use ONLY this data — do not add, infer, or hallucinate.\n"
        f"{geo_ctx} {time_ctx}\n\n"
        f"OFFICIAL DATA:\n{context}\n\n"
        f'CLAIM TO VERIFY: "{query}"\n\n'
        "Set status to: \"true\" (confirmed), \"partial\" (partly supported), "
        "\"false\" (refuted), or \"no_data\" (insufficient).\n\n"
        "Also include: metric_used, alternatives (array), data_vintage, "
        "challenge_type (Numerical Reasoning | Multi-hop Reasoning | "
        "Entity Disambiguation | Combining Tables and Text | "
        "Insufficient Data | None), "
        "reasoning_steps (2-4 sentences), confidence (high|medium|low).\n\n"
        "Respond with a valid JSON object only — no markdown, no extra text:\n"
        "{{\n"
        '  "status": "true|partial|false|no_data",\n'
        '  "title": "Short Title",\n'
        '  "text": "Detailed explanation",\n'
        '  "metric_used": "...",\n'
        '  "alternatives": [],\n'
        '  "data_vintage": "Year or period",\n'
        '  "challenge_type": "None",\n'
        '  "reasoning_steps": ["step 1", "step 2"],\n'
        '  "confidence": "high|medium|low"\n'
        "}}"
    )


# ── API query functions ───────────────────────────────────────────────────────

async def query_pubmed(
    client: httpx.AsyncClient, search_term: str
) -> Optional[dict]:
    """Search PubMed via NCBI E-utilities and return abstracts."""
    base    = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    key_str = f"&api_key={quote(PUBMED_API_KEY)}" if PUBMED_API_KEY else ""
    try:
        sr = await client.get(
            f"{base}esearch.fcgi?db=pubmed"
            f"&term={quote(search_term)}&retmax=3&retmode=json{key_str}",
            timeout=15,
        )
        if not sr.is_success:
            return None
        ids = sr.json().get("esearchresult", {}).get("idlist", [])
        if not ids:
            return None

        ar = await client.get(
            f"{base}efetch.fcgi?db=pubmed"
            f"&id={','.join(ids)}&rettype=abstract&retmode=text{key_str}",
            timeout=15,
        )
        if not ar.is_success:
            return None
        text  = ar.text
        years = re.findall(r"\b(20\d{2}|19\d{2})\b", text)
        date  = str(max(int(y) for y in years)) if years else None
        return {
            "label": "PubMed / NCBI",
            "url":   f"https://pubmed.ncbi.nlm.nih.gov/?term={quote(search_term)}",
            "data":  text[:2500],
            "date":  date,
        }
    except Exception:
        return None


async def query_worldbank(
    client: httpx.AsyncClient, search_term: str
) -> Optional[dict]:
    """Search World Bank Open Data for matching indicators."""
    try:
        ir = await client.get(
            "https://api.worldbank.org/v2/indicator"
            f"?search={quote(search_term)}&format=json&per_page=3",
            timeout=15,
        )
        if not ir.is_success:
            return None
        payload    = ir.json()
        indicators = payload[1] if len(payload) > 1 else []
        if not indicators:
            return None

        ind = indicators[0]
        dr  = await client.get(
            f"https://api.worldbank.org/v2/country/all/indicator/{ind['id']}"
            "?format=json&mrv=1&per_page=10",
            timeout=15,
        )
        if not dr.is_success:
            return None
        rows    = [r for r in (dr.json()[1] or []) if r.get("value") is not None][:8]
        records = "\n".join(
            f"{r['country']['value']}: {r['value']} ({r['date']})" for r in rows
        )
        dates = [int(r["date"]) for r in rows if r.get("date")]
        date  = str(max(dates)) if dates else None
        note  = ind.get("sourceNote", "")
        return {
            "label": "World Bank Open Data",
            "url":   f"https://data.worldbank.org/indicator/{ind['id']}",
            "data":  f"Indicator: {ind['name']}\n{note}\n\nLatest values:\n{records}",
            "date":  date,
        }
    except Exception:
        return None


async def query_who(
    client: httpx.AsyncClient, search_term: str
) -> Optional[dict]:
    """Query the WHO Global Health Observatory OData API."""
    try:
        keywords = " ".join(search_term.lower().split()[:3])
        filter_q = quote(keywords)
        ir = await client.get(
            "https://ghoapi.azureedge.net/api/Indicator"
            f"?$filter=contains(tolower(IndicatorName),'{filter_q}')&$top=1",
            timeout=15,
        )
        if not ir.is_success:
            return None
        items = ir.json().get("value", [])
        if not items:
            return None
        ind = items[0]

        dr = await client.get(
            f"https://ghoapi.azureedge.net/api/{ind['IndicatorCode']}"
            "?$top=10&$orderby=TimeDim desc",
            timeout=15,
        )
        if not dr.is_success:
            return None
        rows    = dr.json().get("value", [])[:8]
        records = "\n".join(
            f"{r.get('SpatialDim', 'Global')}: "
            f"{r.get('NumericValue')} ({r.get('TimeDim')})"
            for r in rows
        )
        years = [int(r["TimeDim"]) for r in rows if str(r.get("TimeDim", "")).isdigit()]
        date  = str(max(years)) if years else None
        code  = ind["IndicatorCode"]
        return {
            "label": "WHO Global Health Observatory",
            "url":   (
                "https://www.who.int/data/gho/data/indicators"
                f"/indicator-details/GHO/{code}"
            ),
            "data":  f"Indicator: {ind['IndicatorName']}\n\nLatest values:\n{records}",
            "date":  date,
        }
    except Exception:
        return None


async def run_source(
    client: httpx.AsyncClient, key: str, query: str, search_terms: dict
) -> Optional[dict]:
    """Dispatch a query to the correct API source and tag its evidence type."""
    term = search_terms.get(key, query)
    if key == "pubmed":
        result = await query_pubmed(client, term)
    elif key == "worldbank":
        result = await query_worldbank(client, term)
    elif key == "who":
        result = await query_who(client, term)
    else:
        return None
    if result:
        result["evidence_type"] = EVIDENCE_TYPES.get(key, "Official Data")
    return result


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze(
    req: ClaimRequest,
    authorization: Optional[str] = Header(default=None),
):
    """Verify a claim against official sources (PubMed, WHO, World Bank)."""
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured on server.")

    query = req.query.strip()
    if not query:
        raise HTTPException(400, "Query is empty.")

    async with httpx.AsyncClient() as client:
        intent  = await preprocess_claim(client, query)
        topics  = (
            {intent["topic"]}
            if intent and intent.get("topic") and intent["topic"] != "general"
            else detect_topics(query)
        )
        selected = [
            key for key, src in API_SOURCES.items()
            if src["enabled"] and (
                not topics or any(c in topics for c in src["categories"])
            )
        ]

        search_terms = intent.get("search_terms", {}) if intent else {}
        tasks        = [run_source(client, k, query, search_terms) for k in selected]
        results      = [r for r in await asyncio.gather(*tasks) if r]

        if not results:
            label = ", ".join(topics) if topics else "general"
            return {
                "status": "no_data", "title": "No Official Data Found",
                "text": f"No results from the {label} sources. Try rephrasing.",
                "sources": [],
            }

        context  = "\n\n".join(
            f"=== {r['label']} [{r.get('evidence_type', 'Official Data')}] ===\n{r['data']}"
            for r in results
        )
        geo_ctx  = (
            f"Geographic focus: {intent['geography']}."
            if intent and intent.get("geography") else ""
        )
        time_ctx = (
            f"Time period referenced: {intent['time_period']}."
            if intent and intent.get("time_period") else ""
        )
        prompt   = _build_official_prompt(context, geo_ctx, time_ctx, query)

        data   = await gemini_post(client, {"contents": [{"parts": [{"text": prompt}]}]})
        raw    = data["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(re.sub(r"```json\n?|```", "", raw).strip())

        result["sources"] = [
            {"name": r["label"], "url": r["url"], "evidence": r.get("evidence_type")}
            for r in results
        ]
        if not result.get("data_vintage"):
            dates = [r["date"] for r in results if r.get("date")]
            if dates:
                result["data_vintage"] = sorted(dates)[-1]

        log_search(authorization, query, "official", result.get("status", ""))
        return result


@router.post("/analyze-web")
async def analyze_web(
    req: ClaimRequest,
    authorization: Optional[str] = Header(default=None),
):
    """Verify a claim using Gemini with Google Search grounding."""
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured on server.")

    query = req.query.strip()
    if not query:
        raise HTTPException(400, "Query is empty.")

    prompt = (
        "You are a fact-checker. Search the web broadly for up-to-date information.\n\n"
        f'Analyze: "{query}"\n\n'
        "Set status to: \"true\" (confirmed), \"partial\" (mixed), "
        "\"false\" (refuted), \"no_data\" (insufficient).\n\n"
        "Respond with valid JSON only — no markdown:\n"
        '{{ "status": "...", "title": "...", "text": "..." }}'
    )

    async with httpx.AsyncClient() as client:
        data      = await gemini_post(client, {
            "contents": [{"parts": [{"text": prompt}]}],
            "tools":    [{"googleSearch": {}}],
        })
        candidate = data["candidates"][0]
        raw       = candidate["content"]["parts"][0]["text"]
        raw       = re.sub(r"```json\n?|```", "", raw).strip()

        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            result = {"status": "partial", "title": "Web Search Result", "text": raw}

        chunks = candidate.get("groundingMetadata", {}).get("groundingChunks", [])
        result["sources"] = [
            {"name": c["web"].get("title") or c["web"]["uri"], "url": c["web"]["uri"]}
            for c in chunks if c.get("web", {}).get("uri")
        ] or [{"name": "General web search", "url": "#"}]

        log_search(authorization, query, "web", result.get("status", ""))
        return result
