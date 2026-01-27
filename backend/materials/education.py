# education.py

def generate_educational_insights(segmented_data):
    """
    Simple educational explanations for a segmented text.
    Currently provides:
      - keywords explained
      - paragraph summaries
      - study tips
    """
    insights = {}

    # Paragraph insights
    paragraphs = segmented_data.get("paragraphs", [])
    insights["paragraph_insights"] = []
    for i, p in enumerate(paragraphs):
        insights["paragraph_insights"].append({
            "paragraph_index": i + 1,
            "text": p,
            "note": "Focus on the main idea. Highlight keywords for review."
        })

    # Keyword explanations
    keywords = segmented_data.get("keywords", [])
    insights["keyword_explanations"] = [
        { "keyword": k, "explanation": f"Review this term: {k}" } for k in keywords
    ]

    # General study tip
    insights["study_tip"] = "Try reading each paragraph and summarizing it in your own words."

    return insights
