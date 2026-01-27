import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GROQ_SUMMARIZATION_KEY = os.getenv("GROQ_SUMMARIZATION_KEY")
GROQ_API_BASE = os.getenv("GROQ_API_BASE", "https://api/groq.com/openai/v1")
MODEL = os.getenv("SUMMARIZATION_MODEL", "llama-3.1-8b-instant")  # optional: separate model


def summarize_text(cleaned_text):
    """
    Sends cleaned text to Groq LLaMA 3 to generate a concise summary.
    Returns a dict that can be saved in Material.summary_data.
    """
    system_prompt = """
You are an educational reading tutor. Summarize the text for high school students.
- Keep it concise and clear
- Highlight main points
- Avoid adding extra information
Return ONLY a plain text summary.
"""

    payload = {
        "model": MODEL,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": cleaned_text},
        ],
        "max_tokens": 1000,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_SUMMARIZATION_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        f"{GROQ_API_BASE}/chat/completions",
        headers=headers,
        json=payload,
    )

    if response.status_code != 200:
        raise Exception(f"Groq API error: {response.text}")

    data = response.json()
    content = data["choices"][0]["message"]["content"]

    # Wrap summary in a dict for JSONField storage
    return {"summary": content.strip()}
