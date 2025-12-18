from django.contrib import admin
from . import models
from import_export.admin import ImportExportModelAdmin


@admin.register(models.Kurikulum)
class KurikulumAdmin(ImportExportModelAdmin):
    list_display = ("id", "nama", "created_at")
    search_fields = (
        "nama",
        "id",
    )
    ordering = ("created_at",)


@admin.register(models.Fase)
class FaseAdmin(ImportExportModelAdmin):
    list_display = ("id", "fase", "created_at")
    search_fields = (
        "fase",
        "id",
    )
    ordering = ("created_at",)


@admin.register(models.Kelas)
class KelasAdmin(ImportExportModelAdmin):
    list_display = ("id", "kelas", "jenjang", "created_at")
    search_fields = (
        "kelas",
        "jenjang",
        "id",
    )
    ordering = ("created_at",)


@admin.register(models.Element)
class ElementAdmin(ImportExportModelAdmin):
    list_display = ("id", "nama", "deskripsi", "kurikulum_id", "created_at")
    search_fields = (
        "nama",
        "deskripsi",
        "kurikulum_id__nama",
        "id",
    )
    ordering = ("created_at",)


@admin.register(models.Materi)
class MateriAdmin(ImportExportModelAdmin):
    list_display = ("id", "nama", "kelas_id", "fase_id", "created_at")
    search_fields = (
        "nama",
        "kelas_id__kelas",
        "fase_id__fase",
        "id",
    )
    ordering = ("created_at",)


@admin.register(models.TujuanPembelajaran)
class TujuanPembelajaranAdmin(ImportExportModelAdmin):
    list_display = ("id", "nama", "kurikulum", "created_at")
    search_fields = (
        "nama",
        "kurikulum__nama",
        "id",
    )
    ordering = ("created_at",)


@admin.register(models.MateriItem)
class MateriItemAdmin(ImportExportModelAdmin):
    list_display = ("id", "nama", "deskripsi", "materi_id", "created_at")
    search_fields = (
        "nama",
        "deskripsi",
        "materi_id__nama",
        "id",
    )
    ordering = ("created_at",)


@admin.register(models.MateriItemVideo)
class MateriItemVideoAdmin(ImportExportModelAdmin):
    list_display = ("id", "video", "materi_item_id", "created_at")
    search_fields = (
        "video",
        "materi_item_id__nama",
        "id",
    )
    ordering = ("created_at",)
