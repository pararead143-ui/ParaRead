import os
import requests
import json
import re

GROQ_QUIZ_KEY = os.getenv("GROQ_QUIZ_KEY")
GROQ_API_BASE = os.getenv("GROQ_API_BASE")
MODEL = os.getenv("MODEL")

def generate_quiz_from_summary(summary_text, num_questions=5):
    """
    Generate multiple-choice questions from a summary using Groq API.
    Returns a list of questions with fields:
    - id (int)
    - question (str)
    - options (list of str)
    - correctAnswer (str, one of "A", "B", "C", "D")
    """
    if not summary_text or summary_text.strip() == "":
        return None

    prompt = f"""
    Generate exactly {num_questions} multiple-choice questions from the summary.
    Each question must have:
    {{
      "id": 1,
      "question": "...",
      "options": ["A...", "B...", "C...", "D..."],
      "answer": "A"
    }}
    RETURN ONLY A VALID JSON ARRAY. NO EXTRA TEXT.

    Summary:
    {summary_text}
    """

    headers = {
        "Authorization": f"Bearer {GROQ_QUIZ_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post(
            f"{GROQ_API_BASE}/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()

        output_text = result["choices"][0]["message"]["content"]

        # Remove ```json ... ``` code fences if present
        output_text = re.sub(r"^```json|```$", "", output_text.strip(), flags=re.MULTILINE)

        # Parse JSON safely
        try:
            questions = json.loads(output_text)

            # Convert "answer" -> "correctAnswer" for frontend
            for q in questions:
                q["correctAnswer"] = q.pop("answer", None)

            return questions

        except json.JSONDecodeError:
            print("❌ Groq returned invalid JSON:", output_text)
            return None

    except requests.RequestException as e:
        print("❌ Error calling Groq:", e)
        return None
