from rest_framework import serializers
from .models import Material
from .models import Vocabulary

MAX_CHARS = 20000  # adjust if needed

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ["id", "title", "raw_text", "segmented_data", "summary_data", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_cleaned_text(self, value):
        if value and len(value) > MAX_CHARS:
            raise serializers.ValidationError(
                f"Text is too long. Maximum allowed is {MAX_CHARS:,} characters."
            )
        return value

class VocabularySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vocabulary
        fields = ["id", "word", "meaning", "example", "created_at"]
        read_only_fields = ["id", "created_at"]