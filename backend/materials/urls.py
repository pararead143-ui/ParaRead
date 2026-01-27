from django.urls import path
from .views import segment_view, summarize_view, materials_list, material_detail, educational_insights, generate_quiz, lookup_definition
from . import views

urlpatterns = [
    path("upload-file/", views.upload_file, name="upload-file"),
    path("", materials_list, name="materials_list"),  # GET all materials
    path("segment/", segment_view, name="segment_material"),
    path("summarize/", summarize_view, name="summarize_material"),
    path("<int:material_id>/", material_detail, name="material_detail"),
    path("<int:material_id>/insights/", educational_insights, name="educational_insights"),
    path("<int:material_id>/generate-quiz/", generate_quiz, name="generate_quiz"),
    path("vocab/", views.vocabulary_list_create, name="vocab_list_create"),
    path("vocab/<int:pk>/", views.vocabulary_delete, name="vocab_delete"),
    path("vocabulary/lookup/", lookup_definition)

]
