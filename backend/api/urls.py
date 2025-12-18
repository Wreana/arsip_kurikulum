from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
    path(
        "materi-items/", views.MateriItemsByMateriAPIView.as_view(), name="materi-items"
    ),
    path(
        "non-paginated/choices/kurikulum/",
        views.NonPaginatedSelectKurikulumViewSets.as_view({"get": "list"}),
    ),
    path(
        "non-paginated/choices/kelas/",
        views.NonPaginatedSelectKelasViewSets.as_view({"get": "list"}),
    ),
    path(
        "non-paginated/choices/fase/",
        views.NonPaginatedSelectFaseViewSets.as_view({"get": "list"}),
    ),
    path(
        "curriculum-overview/",
        views.CurriculumOverviewAPIView.as_view(),
        name="curriculum-overview",
    ),
    path(
        "filter-options/",
        views.FilterOptionsAPIView.as_view(),
        name="filter-options",
    ),
]
