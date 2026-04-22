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


def log_search(token: Optional[str], query: str, tab: str, result_status: str):
    if not supabase or not token:
        return
    try:
        jwt = token.removeprefix("Bearer ").strip()
        user = supabase.auth.get_user(jwt)
        supabase.table("searches").insert({
            "user_id":       user.user.id,
            "query":         query,
            "tab":           tab,
            "result_status": result_status,
        }).execute()
        supabase.table("activity_log").insert({
            "user_id":  user.user.id,
            "action":   "search",
            "metadata": {"tab": tab, "status": result_status},
        }).execute()
    except Exception:
        pass  # never block the response if logging fails

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_URL     = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
PUBMED_API_KEY = os.environ.get("PUBMED_API_KEY", "")

TOPIC_KEYWORDS = {
    "health":        ["health", "disease", "obesity", "overweight", "cancer", "diabetes",
                      "mortality", "death", "hospital", "medicine", "drug", "vaccine",
                      "infection", "virus", "mental", "depression", "suicide", "nutrition",
                      "diet", "smoking", "alcohol", "bmi", "weight", "heart", "lung",
                      "covid", "pandemic", "epidemic", "life expectancy", "healthcare"],
    "finance":       ["gdp", "economy", "economic", "finance", "financial", "inflation",
                      "debt", "deficit", "trade", "export", "import", "income", "poverty",
                      "wealth", "bank", "stock", "market", "investment", "tax", "budget",
                      "fiscal", "monetary", "interest rate", "currency", "dollar", "euro",
                      "recession", "growth", "cost of living", "price", "wages"],
    "labor":         ["job", "jobs", "employment", "unemployment", "worker", "workers",
                      "wage", "salary", "work", "labor", "labour", "workforce", "career",
                      "occupation", "hire", "fired", "layoff", "automation", "replace",
                      "gig", "remote", "productivity", "strike"],
    "demographics":  ["population", "demographic", "birth", "fertility", "migration",
                      "immigrant", "census", "race", "ethnicity", "gender", "american",
                      "americans", "people", "country", "nation", "household", "age",
                      "elderly", "children", "youth", "urban", "rural"],
    "environment":   ["climate", "environment", "carbon", "emission", "pollution",
                      "temperature", "warming", "energy", "renewable", "fossil fuel",
                      "deforestation", "biodiversity", "species", "ocean", "water",
                      "plastic", "waste", "greenhouse", "sea level"],
    "energy":        ["electricity", "oil", "gas", "coal", "solar", "wind", "nuclear",
                      "barrel", "kwh", "megawatt", "power plant", "petroleum",
                      "gasoline", "natural gas", "grid", "energy consumption",
                      "energy production", "eia", "opec", "refinery"],
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
    query: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def detect_topics(query: str) -> set:
    q = query.lower()
    matched = set()
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            matched.add(topic)
    return matched


async def gemini_post(client: httpx.AsyncClient, payload: dict) -> dict:
    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
    r = await client.post(url, json=payload, timeout=30)
    r.raise_for_status()
    return r.json()


async def preprocess_claim(client: httpx.AsyncClient, query: str) -> dict | None:
    if not GEMINI_API_KEY:
        return None
    prompt = f"""Extract structured intent from this statistical claim. Respond with a valid JSON object only — no markdown, no extra text.

CLAIM: "{query}"

{{
  "topic": "health | finance | labor | demographics | environment | general",
  "geography": "country or region name, or 'global' if not specified",
  "time_period": "specific year or range (e.g. '2023', '2020-2023'), or 'latest' if not specified",
  "metric": "the specific statistic being claimed in plain English",
  "search_terms": {{
    "pubmed": "optimized 3-5 word medical/scientific search string",
    "worldbank": "optimized 3-5 word World Bank indicator search string",
    "who": "optimized 2-3 word WHO indicator search string (strict limit)"
  }}
}}"""
    try:
        data = await gemini_post(client, {"contents": [{"parts": [{"text": prompt}]}]})
        raw  = data["candidates"][0]["content"]["parts"][0]["text"]
        raw  = re.sub(r"```json\n?|```", "", raw).strip()
        return json.loads(raw)
    except Exception:
        return None


# ── API query functions ───────────────────────────────────────────────────────

async def query_pubmed(client: httpx.AsyncClient, query: str, search_term: str) -> dict | None:
    base    = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    key_str = f"&api_key={quote(PUBMED_API_KEY)}" if PUBMED_API_KEY else ""
    try:
        sr = await client.get(
            f"{base}esearch.fcgi?db=pubmed&term={quote(search_term)}&retmax=3&retmode=json{key_str}",
            timeout=15,
        )
        if not sr.is_success:
            return None
        ids = sr.json().get("esearchresult", {}).get("idlist", [])
        if not ids:
            return None

        ar = await client.get(
            f"{base}efetch.fcgi?db=pubmed&id={','.join(ids)}&rettype=abstract&retmode=text{key_str}",
            timeout=15,
        )
        if not ar.is_success:
            return None
        text = ar.text

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


async def query_worldbank(client: httpx.AsyncClient, search_term: str) -> dict | None:
    try:
        ir = await client.get(
            f"https://api.worldbank.org/v2/indicator?search={quote(search_term)}&format=json&per_page=3",
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
            f"https://api.worldbank.org/v2/country/all/indicator/{ind['id']}?format=json&mrv=1&per_page=10",
            timeout=15,
        )
        if not dr.is_success:
            return None
        rows    = [r for r in (dr.json()[1] or []) if r.get("value") is not None][:8]
        records = "\n".join(f"{r['country']['value']}: {r['value']} ({r['date']})" for r in rows)

        dates = [int(r["date"]) for r in rows if r.get("date")]
        date  = str(max(dates)) if dates else None

        return {
            "label": "World Bank Open Data",
            "url":   f"https://data.worldbank.org/indicator/{ind['id']}",
            "data":  f"Indicator: {ind['name']}\n{ind.get('sourceNote', '')}\n\nLatest values:\n{records}",
            "date":  date,
        }
    except Exception:
        return None


async def query_who(client: httpx.AsyncClient, search_term: str) -> dict | None:
    try:
        keywords = " ".join(search_term.lower().split()[:3])
        ir = await client.get(
            f"https://ghoapi.azureedge.net/api/Indicator?$filter=contains(tolower(IndicatorName),'{quote(keywords)}')&$top=1",
            timeout=15,
        )
        if not ir.is_success:
            return None
        items = ir.json().get("value", [])
        if not items:
            return None
        ind = items[0]

        dr = await client.get(
            f"https://ghoapi.azureedge.net/api/{ind['IndicatorCode']}?$top=10&$orderby=TimeDim desc",
            timeout=15,
        )
        if not dr.is_success:
            return None
        rows    = dr.json().get("value", [])[:8]
        records = "\n".join(
            f"{r.get('SpatialDim', 'Global')}: {r.get('NumericValue')} ({r.get('TimeDim')})"
            for r in rows
        )

        years = [int(r["TimeDim"]) for r in rows if str(r.get("TimeDim", "")).isdigit()]
        date  = str(max(years)) if years else None

        return {
            "label": "WHO Global Health Observatory",
            "url":   f"https://www.who.int/data/gho/data/indicators/indicator-details/GHO/{ind['IndicatorCode']}",
            "data":  f"Indicator: {ind['IndicatorName']}\n\nLatest values:\n{records}",
            "date":  date,
        }
    except Exception:
        return None


async def run_source(client: httpx.AsyncClient, key: str, query: str, search_terms: dict) -> dict | None:
    term = search_terms.get(key, query)
    if key == "pubmed":
        result = await query_pubmed(client, query, term)
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
async def analyze(req: ClaimRequest, authorization: Optional[str] = Header(default=None)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured on server.")

    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is empty.")

    async with httpx.AsyncClient() as client:
        intent = await preprocess_claim(client, query)

        topics = (
            {intent["topic"]}
            if intent and intent.get("topic") and intent["topic"] != "general"
            else detect_topics(query)
        )

        selected = [
            key for key, src in API_SOURCES.items()
            if src["enabled"] and (not topics or any(c in topics for c in src["categories"]))
        ]

        search_terms = intent.get("search_terms", {}) if intent else {}
        tasks        = [run_source(client, key, query, search_terms) for key in selected]
        raw_results  = await asyncio.gather(*tasks)
        results      = [r for r in raw_results if r]

        if not results:
            topic_label = ", ".join(topics) if topics else "general"
            return {
                "status":  "no_data",
                "title":   "No Official Data Found",
                "text":    f"No results from the {topic_label} sources. Try rephrasing.",
                "sources": [],
            }

        context      = "\n\n".join(f"=== {r['label']} [{r.get('evidence_type', 'Official Data')}] ===\n{r['data']}" for r in results)
        geo_ctx      = f"Geographic focus: {intent['geography']}." if intent and intent.get("geography") else ""
        time_ctx     = f"Time period referenced: {intent['time_period']}." if intent and intent.get("time_period") else ""

        prompt = f"""You are a strict statistical fact-checker.

Below is data retrieved directly from official sources. Each source is labeled with its evidence type.
Use ONLY this data — do not add, infer, or hallucinate any information not present below.
{geo_ctx} {time_ctx}

OFFICIAL DATA:
{context}

CLAIM TO VERIFY: "{query}"

Based solely on the data above:
- If the data confirms the claim, set status to "true".
- If the data partially supports or contradicts the claim, set status to "partial".
- If the data clearly refutes the claim, set status to "false".
- If the data is insufficient or unrelated to verify the claim, set status to "no_data".

IMPORTANT — also include:
- metric_used: the exact metric/definition from the data used to evaluate this claim.
- alternatives: array of other metric definitions that could give a different result. Empty array if none.
- data_vintage: the most recent data year/period used.
- challenge_type: one of: "Numerical Reasoning" | "Multi-hop Reasoning" | "Entity Disambiguation" | "Combining Tables and Text" | "Insufficient Data" | "None"
- reasoning_steps: array of 2-4 short sentences showing the logical steps taken to reach the verdict
- confidence: "high" | "medium" | "low"

Respond with a valid JSON object only — no markdown, no extra text:
{{
  "status": "true" | "partial" | "false" | "no_data",
  "title": "Short Title",
  "text": "Detailed explanation citing specific numbers from the data above",
  "metric_used": "The specific metric/definition used",
  "alternatives": [],
  "data_vintage": "Year or period",
  "challenge_type": "None",
  "reasoning_steps": ["step 1", "step 2"],
  "confidence": "high | medium | low"
}}"""

        data   = await gemini_post(client, {"contents": [{"parts": [{"text": prompt}]}]})
        raw    = data["candidates"][0]["content"]["parts"][0]["text"]
        raw    = re.sub(r"```json\n?|```", "", raw).strip()
        result = json.loads(raw)

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
async def analyze_web(req: ClaimRequest, authorization: Optional[str] = Header(default=None)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured on server.")

    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is empty.")

    prompt = f"""You are a fact-checker that searches the web broadly for up-to-date information.

Analyze the following claim: "{query}"

Use web search to find relevant, recent information from news articles, research papers, government websites, and other credible online sources.

Based on what you find:
- If credible sources confirm the claim, set status to "true".
- If sources partially support it or important context changes the meaning, set status to "partial".
- If credible sources contradict the claim, set status to "false".
- If you cannot find enough information, set status to "no_data".

Respond with a valid JSON object only — no markdown, no extra text:
{{ "status": "true" | "partial" | "false" | "no_data", "title": "Short Title", "text": "Detailed explanation citing specific sources and data found on the web" }}"""

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
        sources = [
            {"name": c["web"].get("title") or c["web"]["uri"], "url": c["web"]["uri"]}
            for c in chunks if c.get("web", {}).get("uri")
        ]
        result["sources"] = sources or [{"name": "General web search", "url": "#"}]

        log_search(authorization, query, "web", result.get("status", ""))
        return result
