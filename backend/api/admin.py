from django.contrib import admin
from . import models
from import_export.admin import ImportExportModelAdmin


@admin.register(models.Kurikulum)
class KurikulumAdmin(ImportExportModelAdmin):
    list_display = ("id", "nama", "created_at")
    search_fields = ("nama",)
    ordering = ("created_at",)


@admin.register(models.Materi)
class MateriAdmin(ImportExportModelAdmin):
    list_display = ("id", "nama", "kurikulum_id", "flow_number")
    search_fields = (
        "nama",
        "kurikulum_id__nama",
    )
    ordering = ("created_at",)


@admin.register(models.MateriItem)
class MateriItemAdmin(ImportExportModelAdmin):
    list_display = (
        "id",
        "nama",
        "materi_id",
        "qc_approve",
    )
    list_filter = ("qc_approve",)
    search_fields = (
        "nama",
        "id",
        "level",
        "qc_approve",
        "materi_id__nama",
    )
    ordering = ("created_at",)


@admin.register(models.MateriItemVideo)
class MateriItemVideoAdmin(ImportExportModelAdmin):
    list_display = (
        "id",
        "materi_item_id",
    )
    search_fields = (
        "materi_item_id__nama",
        "id",
    )
    ordering = ("created_at",)
