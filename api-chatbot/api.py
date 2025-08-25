from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import json
import re
import os
from langchain_community.tools import DuckDuckGoSearchResults
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware

# --- CONFIG ---
load_dotenv(dotenv_path="../.env") 

LMSTUDIO_BASE_URL = os.getenv("LMSTUDIO_BASE_URL")
LMSTUDIO_API_KEY = os.getenv("LMSTUDIO_API_KEY")
TOP_K_PAGES = int(os.getenv("TOP_K_PAGES", 3))
MAX_CONTEXT_CHARS = int(os.getenv("MAX_CONTEXT_CHARS", 10000))
MODEL_NAME = os.getenv("MODEL_NAME")

# Initialize LLM
llm = ChatOpenAI(
    base_url=LMSTUDIO_BASE_URL,
    api_key=LMSTUDIO_API_KEY,
    model=MODEL_NAME,
    temperature=0,
    max_tokens=9000,
    max_retries=2
)

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

# --- Prompts ---
extract_prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a precise recipe extractor. Given raw webpage text, return ONLY the recipe in valid JSON format. "
     "Strict rules:\n"
     "- Include ONLY the keys in the schema; no extra fields.\n"
     "- All fields must exist. If data is missing, use '(missing)' for strings and [] for lists.\n"
     "- 'recipeName', 'description', 'time', 'category', 'notes' must be strings.\n"
     "- 'tags' must be a JSON array of strings.\n"
     "- 'ingredients' must be a list of objects with exactly 'name', 'quantity', 'preperation'.\n"
     "- 'instructions' must be a list of strings.\n"
     "- Ingredients:\n"
     "  • 'name': ingredient name only, no numbers or units.\n"
     "  • 'quantity': number + unit only.\n"
     "  • 'preperation': preparation details only.\n"
     "- Instructions: concise, actionable, no ingredient amounts.\n"
     "- Description: a short overview of the dish.\n"
     "- Notes: one string with tips.\n"
     "- If this page has no recipe, still output a valid JSON object with '(missing)' or [] values.\n"
     f"Use strictly this JSON schema:\n{recipe_schema}"
    ),
    ("human", "Page text (max 10k chars):\n\n{page_text}")
])
extract_chain = extract_prompt | llm

synthesize_prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a professional chef and JSON expert. Always produce ONE final JSON recipe.\n"
     "Cases:\n"
     "- If extracted recipes exist: learn and merge them into a single cohesive recipe.\n"
     "- If none exist (or they are all '(missing)'): invent a plausible recipe for '{recipe_name}'.\n"
     "Strict rules:\n"
     "- Include ONLY the keys in the schema; no extra fields.\n"
     "- All fields must exist. If data is missing, add the details based on what you learned on the extracted JSON objects.\n"
     "- 'recipeName', 'description', 'time', 'category', 'notes' must be strings.\n"
     "- 'tags' must be a JSON array of strings.\n"
     "- 'ingredients' must be a list of objects with exactly 'name', 'quantity', 'preperation'.\n"
     "- 'instructions' must be a list of strings.\n"
     "- Ingredients:\n"
     "  • 'name': ingredient name only.\n"
     "  • 'quantity': number + unit only.\n"
     "  • 'preperation': prep details only.\n"
     "- Instructions: concise, step-by-step, no ingredient quantities.\n"
     "- Description: a short overview of the dish, never empty.\n"
     "- Notes: a single helpful paragraph, never empty if possible.\n"
     "- Do NOT add markdown, explanations, or labels; output JSON only.\n"
     f"Use strictly this JSON schema:\n{recipe_schema}"
    ),
    ("human",
     "Here are the extracted recipe JSON objects:\n{extracted_blocks}\n"
     "Now create ONE final JSON recipe for '{recipe_name}'.")
])
synthesize_chain = synthesize_prompt | llm


# --- Post-processing ---
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
        candidate = text[i:j+1] if (i != -1 and j != -1 and j > i) else text
        try:
            data = json.loads(candidate)
        except Exception:
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
                    norm_ingredients.append({"name": str(ing), "quantity": "", "preperation": ""})
            data["ingredients"] = norm_ingredients
        if not isinstance(data.get("instructions"), list):
            data["instructions"] = [str(data.get("instructions", "")).strip()] if data.get("instructions") else []
        if not isinstance(data.get("notes"), str):
            data["notes"] = str(data["notes"]) if data.get("notes") is not None else "(missing)"
        if not isinstance(data.get("description"), str):
            data["description"] = str(data["description"]) if data.get("description") is not None else "(missing)"
        return data
    except Exception:
        return defaults


# --- FastAPI App ---
app = FastAPI(title="Recipe Extractor API")

# Allow requests from your frontend
origins = [
    "http://localhost:5173",  # Vite/React/other dev server
    "http://127.0.0.1:5173",  # just in case
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],            # allow all HTTP methods
    allow_headers=["*"],            # allow all headers
)


class RecipeRequest(BaseModel):
    query: str

class RecipeResponse(BaseModel):
    json: dict

@app.post("/extract_recipe", response_model=RecipeResponse)
async def extract_recipe(req: RecipeRequest):
    query = req.query

    # Step 1: Search
    search = DuckDuckGoSearchResults(output_format="list")
    results = search.invoke(query + " recipe english")
    urls = [item.get("link") for item in results if "link" in item]

    # Step 2: Extract recipes
    extracted_recipes = []
    for url in urls[:TOP_K_PAGES]:
        try:
            loader = WebBaseLoader(url)
            page_docs = loader.load()
            page_text = "\n\n".join([doc.page_content for doc in page_docs])[:MAX_CONTEXT_CHARS]
            extracted_raw = extract_chain.invoke({"page_text": page_text}).content.strip()
            extracted_recipes.append(extracted_raw)
        except Exception:
            continue

    # Step 3: Combine recipes (can be empty)
    combined_context = "\n\n---\n\n".join(extracted_recipes) if extracted_recipes else "[]"

    # Step 4: Synthesize final recipe
    final_raw = synthesize_chain.invoke({
        "extracted_blocks": combined_context,
        "recipe_name": query
    }).content.strip()

    recipe_dict = safe_parse_json(final_raw)

    return RecipeResponse(json=recipe_dict)
