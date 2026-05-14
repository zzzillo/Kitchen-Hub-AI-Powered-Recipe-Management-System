from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from dotenv import load_dotenv
import json
import re
import os
import logging
import time
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from google import genai
from google.genai.types import GenerateContentConfig
from bs4 import BeautifulSoup
from fastapi.middleware.cors import CORSMiddleware

# --- Logging setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# --- CONFIG ---
load_dotenv(dotenv_path="../.env")

LMSTUDIO_API_KEY = os.getenv("LMSTUDIO_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-2.5-flash")
GEMINI_REQUEST_RETRIES = int(os.getenv("GEMINI_REQUEST_RETRIES", 0))
GEMINI_RETRY_BACKOFF_SECONDS = float(os.getenv("GEMINI_RETRY_BACKOFF_SECONDS", 1.5))

LLM_API_KEY = os.getenv("GEMINI_API_KEY", LMSTUDIO_API_KEY)
gemini_client = genai.Client(api_key=LLM_API_KEY) if LLM_API_KEY else None


def parse_allowed_origins():
    configured = os.getenv("FRONTEND_URL", "")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]

    if not origins:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]

    return origins

# --- Recipe Schema ---
recipe_schema = """
{{
  "recipeName": str,
  "description": str,
  "time": str,
  "category": str,
  "tags": [str, ...],
  "ingredients": [
    {{
      "name": str,
      "quantity": str,
      "preperation": str
    }},
    ...
  ],
  "instructions": [str, ...],
  "notes": str
}}
"""


def safe_parse_json(text: str):
    defaults = {
        "recipeName": "(missing)",
        "description": "(missing)",
        "time": "(missing)",
        "category": "(missing)",
        "tags": [],
        "ingredients": [],
        "instructions": [],
        "notes": "(missing)"
    }

    try:
        fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if fenced:
            text = fenced.group(1)

        text = text.strip()
        i, j = text.find("{"), text.rfind("}")
        candidate = text[i:j + 1] if (i != -1 and j != -1 and j > i) else text

        try:
            data = json.loads(candidate)
        except Exception:
            logger.error("Failed to parse JSON, returning defaults")
            logger.error(f"Raw text that failed JSON parse: {text[:2000]}")
            return defaults

        for k, v in defaults.items():
            if k not in data or data[k] is None:
                data[k] = v

        if not isinstance(data.get("tags"), list):
            data["tags"] = [str(data.get("tags", "")).strip()] if data.get("tags") else []

        if not isinstance(data.get("ingredients"), list):
            data["ingredients"] = []
        else:
            norm_ingredients = []

            for ing in data["ingredients"]:
                if isinstance(ing, dict):
                    norm_ingredients.append({
                        "name": ing.get("name", "").strip(),
                        "quantity": ing.get("quantity", "").strip(),
                        "preperation": ing.get("preperation", "").strip()
                    })
                else:
                    norm_ingredients.append({
                        "name": str(ing),
                        "quantity": "",
                        "preperation": ""
                    })

            data["ingredients"] = norm_ingredients

        if not isinstance(data.get("instructions"), list):
            data["instructions"] = [str(data.get("instructions", "")).strip()] if data.get("instructions") else []

        if not isinstance(data.get("notes"), str):
            data["notes"] = str(data["notes"]) if data.get("notes") is not None else "(missing)"

        if not isinstance(data.get("description"), str):
            data["description"] = str(data["description"]) if data.get("description") is not None else "(missing)"

        return data

    except Exception as e:
        logger.error(f"Exception in safe_parse_json: {e}", exc_info=True)
        return defaults


# --- Raw Gemini logging helpers ---
def _safe_to_dict(obj):
    if obj is None:
        return None

    if isinstance(obj, (str, int, float, bool)):
        return obj

    if isinstance(obj, list):
        return [_safe_to_dict(item) for item in obj]

    if isinstance(obj, tuple):
        return [_safe_to_dict(item) for item in obj]

    if isinstance(obj, dict):
        return {str(k): _safe_to_dict(v) for k, v in obj.items()}

    if hasattr(obj, "to_json_dict"):
        try:
            return obj.to_json_dict()
        except Exception:
            pass

    if hasattr(obj, "model_dump"):
        try:
            return obj.model_dump()
        except Exception:
            pass

    if hasattr(obj, "__dict__"):
        try:
            return {
                key: _safe_to_dict(value)
                for key, value in obj.__dict__.items()
                if not key.startswith("_")
            }
        except Exception:
            pass

    return str(obj)


def log_raw_gemini_response(response, label: str):
    logger.info("=" * 80)
    logger.info(label)
    logger.info("=" * 80)

    try:
        data = _safe_to_dict(response)
        text = json.dumps(data, indent=2, ensure_ascii=False)

        max_chars = 30000
        if len(text) > max_chars:
            logger.info(text[:max_chars])
            logger.info(f"... RAW RESPONSE TRUNCATED. Total chars: {len(text)}")
        else:
            logger.info(text)

    except Exception as exc:
        logger.warning(f"Could not log raw Gemini response: {exc}", exc_info=True)
        logger.info(f"Fallback response string: {str(response)[:5000]}")


def log_gemini_links(response):
    logger.info("=" * 80)
    logger.info("GEMINI LINK SUMMARY")
    logger.info("=" * 80)

    candidates = getattr(response, "candidates", []) or []
    logger.info(f"Candidate count: {len(candidates)}")

    for candidate_index, candidate in enumerate(candidates):
        logger.info("-" * 80)
        logger.info(f"Candidate {candidate_index}")
        logger.info("-" * 80)

        grounding_metadata = getattr(candidate, "grounding_metadata", None)

        if grounding_metadata:
            logger.info("grounding_metadata exists")

            chunks = getattr(grounding_metadata, "grounding_chunks", []) or []
            logger.info(f"grounding_chunks count: {len(chunks)}")

            for chunk_index, chunk in enumerate(chunks):
                web = getattr(chunk, "web", None)
                uri = getattr(web, "uri", None) if web else None
                title = getattr(web, "title", None) if web else None

                logger.info(f"GROUNDING URL {chunk_index}: title={title} | uri={uri}")
        else:
            logger.warning("No grounding_metadata found")

        url_context_metadata = getattr(candidate, "url_context_metadata", None)

        if url_context_metadata:
            logger.info("url_context_metadata exists")

            url_metadata = getattr(url_context_metadata, "url_metadata", []) or []
            logger.info(f"url_metadata count: {len(url_metadata)}")

            for url_index, metadata in enumerate(url_metadata):
                retrieved_url = getattr(metadata, "retrieved_url", None)
                status = getattr(metadata, "url_retrieval_status", None)

                logger.info(f"URL_CONTEXT URL {url_index}: status={status} | url={retrieved_url}")
        else:
            logger.warning("No url_context_metadata found")


def _request_gemini(contents: str, tools: list[dict], model_name: str):
    logger.info("=" * 80)
    logger.info(f"Calling Gemini model '{model_name}'")
    logger.info(f"Tools: {tools}")
    logger.info("=" * 80)

    # IMPORTANT:
    # Do NOT use response_mime_type="application/json" with tools.
    # It causes:
    # Tool use with a response mime type: 'application/json' is unsupported
    response = gemini_client.models.generate_content(
        model=model_name,
        contents=contents,
        config=GenerateContentConfig(
            tools=tools,
            temperature=0,
        ),
    )

    text = (getattr(response, "text", None) or "").strip()

    if not text and getattr(response, "candidates", None):
        content = getattr(response.candidates[0], "content", None)
        parts = getattr(content, "parts", None) or []
        text = "\n".join(
            part.text for part in parts if getattr(part, "text", None)
        ).strip()

    logger.info(f"Gemini text exists: {bool(text)}")
    logger.info(f"Gemini text preview: {text[:500] if text else '(empty)'}")

    return text, response


def _generate_with_tools(contents: str, tools: list[dict]):
    if not gemini_client:
        raise RuntimeError("GEMINI_API_KEY is not set")

    last_error = None

    for attempt in range(GEMINI_REQUEST_RETRIES + 1):
        try:
            logger.info(f"Trying model '{MODEL_NAME}', attempt {attempt + 1}/{GEMINI_REQUEST_RETRIES + 1}")
            return _request_gemini(contents, tools, MODEL_NAME)

        except Exception as exc:
            body = str(exc)[:1000]
            last_error = exc

            logger.warning(
                "Gemini request failed on attempt %s/%s: %s",
                attempt + 1,
                GEMINI_REQUEST_RETRIES + 1,
                body,
            )

            if "429" in str(exc) or "RESOURCE_EXHAUSTED" in str(exc):
                logger.error("Gemini quota exceeded. Stopping retries.")
                raise RuntimeError(f"Gemini quota exceeded: {exc}") from exc

            if attempt < GEMINI_REQUEST_RETRIES:
                sleep_seconds = GEMINI_RETRY_BACKOFF_SECONDS * (2 ** attempt)
                logger.info(f"Retrying after {sleep_seconds} second(s)")
                time.sleep(sleep_seconds)

    raise RuntimeError(f"Gemini request failed after retries: {last_error}")


def _collect_grounded_urls(response):
    urls = []
    seen = set()

    logger.info("=" * 80)
    logger.info("COLLECTING GEMINI URLS")
    logger.info("=" * 80)

    candidates = getattr(response, "candidates", []) or []
    logger.info(f"Candidate count: {len(candidates)}")

    for candidate_index, candidate in enumerate(candidates):
        grounding_metadata = getattr(candidate, "grounding_metadata", None)

        if grounding_metadata:
            chunks = getattr(grounding_metadata, "grounding_chunks", []) or []
            logger.info(f"Candidate {candidate_index}: grounding chunk count = {len(chunks)}")

            for chunk_index, chunk in enumerate(chunks):
                web = getattr(chunk, "web", None)
                uri = getattr(web, "uri", None) if web else None
                title = getattr(web, "title", None) if web else None

                logger.info(f"Grounding URL {chunk_index}: title={title}, uri={uri}")

                if uri and uri.startswith("http") and uri not in seen:
                    seen.add(uri)
                    urls.append(uri)
        else:
            logger.warning(f"Candidate {candidate_index}: no grounding_metadata found")

        url_context_metadata = getattr(candidate, "url_context_metadata", None)

        if url_context_metadata:
            url_metadata = getattr(url_context_metadata, "url_metadata", []) or []
            logger.info(f"Candidate {candidate_index}: url_context URL count = {len(url_metadata)}")

            for url_index, metadata in enumerate(url_metadata):
                retrieved_url = getattr(metadata, "retrieved_url", None)
                status = getattr(metadata, "url_retrieval_status", None)

                logger.info(f"URL Context URL {url_index}: status={status}, url={retrieved_url}")

                if retrieved_url and retrieved_url.startswith("http") and retrieved_url not in seen:
                    seen.add(retrieved_url)
                    urls.append(retrieved_url)
        else:
            logger.warning(f"Candidate {candidate_index}: no url_context_metadata found")

    logger.info(f"Final collected URL count: {len(urls)}")

    for i, url in enumerate(urls):
        logger.info(f"COLLECTED URL {i}: {url}")

    return urls


def _extract_image_from_page(url: str):
    logger.info("=" * 80)
    logger.info(f"Trying to extract image from URL: {url}")
    logger.info("=" * 80)

    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"
            ),
            "Accept": "text/html,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
    )

    with urlopen(request, timeout=10) as response:
        content_type = response.headers.get("Content-Type", "")
        html = response.read()

    logger.info(f"Opened URL successfully: {url}")
    logger.info(f"Content-Type: {content_type}")
    logger.info(f"Content size: {len(html)} bytes")

    if content_type.startswith("image/"):
        logger.info(f"URL itself is already an image: {url}")
        return url

    soup = BeautifulSoup(html, "lxml")

    meta_candidates = [
        ("meta", {"property": "og:image"}, "content"),
        ("meta", {"property": "og:image:secure_url"}, "content"),
        ("meta", {"name": "twitter:image"}, "content"),
        ("meta", {"property": "twitter:image"}, "content"),
        ("link", {"rel": "image_src"}, "href"),
    ]

    logger.info("Checking metadata image tags...")

    for tag_name, attrs, attr_name in meta_candidates:
        tag = soup.find(tag_name, attrs=attrs)
        value = tag.get(attr_name) if tag and tag.get(attr_name) else None

        logger.info(f"Metadata image check {tag_name} {attrs}: {value}")

        if value:
            image_url = urljoin(url, value)
            logger.info(f"IMAGE FOUND FROM METADATA: {image_url}")
            return image_url

    img_tags = soup.find_all("img", src=True)
    logger.info(f"Total img tags found: {len(img_tags)}")

    for img_index, img in enumerate(img_tags[:30]):
        src = img.get("src", "")
        alt = img.get("alt", "")
        width = img.get("width", "")
        height = img.get("height", "")
        image_url = urljoin(url, src)

        logger.info(
            f"IMG {img_index}: src={src}, full={image_url}, alt={alt}, width={width}, height={height}"
        )

    for img in img_tags[:30]:
        src = img.get("src", "")

        if not src:
            continue

        lowered = src.lower()

        if "logo" in lowered or "icon" in lowered or "sprite" in lowered:
            continue

        image_url = urljoin(url, src)
        logger.info(f"SELECTED FIRST USABLE IMG TAG: {image_url}")
        return image_url

    logger.warning(f"No image found from URL: {url}")
    return ""


def find_recipe_image(urls: list[str]):
    logger.info("=" * 80)
    logger.info("STARTING IMAGE EXTRACTION FROM GEMINI LINKS")
    logger.info(f"URLs received: {len(urls)}")
    logger.info("=" * 80)

    for index, url in enumerate(urls):
        try:
            logger.info(f"Checking URL {index + 1}/{len(urls)}: {url}")

            image_url = _extract_image_from_page(url)

            if image_url:
                logger.info(f"FINAL SELECTED IMAGE URL: {image_url}")
                return image_url

        except Exception as exc:
            logger.warning(f"Image extraction failed for URL {url}: {exc}", exc_info=True)

    logger.warning("No image found from Gemini URLs")
    return ""


def build_final_recipe(query: str):
    prompt = (
        "You are a professional chef and JSON expert. "
        "Use Google Search grounding and URL context to study recipe sources, then produce ONE final JSON recipe.\n"
        "Important: use web sources when possible so source URLs are available in grounding metadata.\n"
        f"Recipe name: {query}\n\n"
        "Strict rules:\n"
        "- Output JSON only. No markdown. No explanation.\n"
        "- Include ONLY the keys in the schema; no extra fields.\n"
        "- All fields must exist.\n"
        "- 'recipeName', 'description', 'time', 'category', 'notes' must be strings.\n"
        "- 'tags' must be a JSON array of strings.\n"
        "- 'ingredients' must be a list of objects with exactly 'name', 'quantity', 'preperation'.\n"
        "- 'instructions' must be a list of strings.\n"
        f"Use strictly this JSON schema:\n{recipe_schema}"
    )

    final_raw, response = _generate_with_tools(
        prompt,
        [
            {"google_search": {}},
            {"url_context": {}},
        ],
    )

    log_gemini_links(response)
    log_raw_gemini_response(response, "RAW GEMINI GROUNDED RESPONSE")

    if not final_raw.strip():
        raise RuntimeError("Gemini response was empty")

    logger.info(f"Final Gemini JSON preview: {final_raw[:1000]}")

    return final_raw, response


# --- FastAPI App ---
app = FastAPI(title="Recipe Extractor API")

origins = parse_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecipeRequest(BaseModel):
    query: str


class RecipeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    json_data: dict = Field(alias="json")


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/extract_recipe", response_model=RecipeResponse)
async def extract_recipe(req: RecipeRequest):
    query = req.query
    logger.info("#" * 80)
    logger.info(f"Received query: {query}")
    logger.info("#" * 80)

    try:
        final_raw, grounded_response = build_final_recipe(query)

        recipe_dict = safe_parse_json(final_raw)

        urls = _collect_grounded_urls(grounded_response)
        image_url = find_recipe_image(urls)

        recipe_dict["imageUrl"] = image_url

        logger.info("=" * 80)
        logger.info(f"FINAL imageUrl returned to frontend: {recipe_dict.get('imageUrl')}")
        logger.info(f"FINAL recipe preview: {json.dumps(recipe_dict, indent=2)[:1200]}")
        logger.info("=" * 80)

        return RecipeResponse(json_data=recipe_dict)

    except Exception as exc:
        logger.error(f"Recipe extraction failed for '{query}': {exc}", exc_info=True)

        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc
