# segmentation.py

import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_BASE = os.getenv("GROQ_API_BASE", "https://api.groq.com/openai/v1")
MODEL = os.getenv("MODEL", "llama-3.1-8b-instant")


def segment_text(cleaned_text):
    """
    Sends cleaned text to Groq LLaMA 3 and returns educational segments.
    """

    system_prompt = """
You are an educational reading tutor. Break the given text into small learning segments for high school students.

Each segment should include:
- an original chunk (80–250 words)
- a simple explanation (2–3 sentences)
- 3–6 key terms
- one example OR one practice question

Return ONLY a JSON array, like:
[
  {
    "segment": "...",
    "explanation": "...",
    "key_terms": ["...", "..."],
    "example": "..."
  }
]
"""

    payload = {
        "model": MODEL,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": cleaned_text},
        ],
        "max_tokens": 2000,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        f"{GROQ_API_BASE}/chat/completions",
        headers=headers,
        json=payload,
    )

    # If error from API
    if response.status_code != 200:
        raise Exception(f"Groq API error: {response.text}")

    data = response.json()
    content = data["choices"][0]["message"]["content"]

    # Try to parse JSON
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"error": "Could not parse JSON", "raw": content}
