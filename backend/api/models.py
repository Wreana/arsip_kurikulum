from django.db import models
from django.utils import timezone


class Kurikulum(models.Model):
    nama = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.nama


class Materi(models.Model):
    kurikulum_id = models.ForeignKey(
        Kurikulum, on_delete=models.CASCADE, blank=True, null=True
    )
    nama = models.CharField(max_length=255, blank=True, null=True)
    flow_number = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.nama


class MateriItem(models.Model):
    materi_id = models.ForeignKey(
        Materi, on_delete=models.CASCADE, blank=True, null=True
    )
    qc_approve = models.BooleanField(default=False)
    nama = models.CharField(max_length=255, blank=True, null=True)
    deskripsi = models.TextField(blank=True, null=True)
    module_qc = models.FileField(upload_to="kurikulum/module/", blank=True, null=True)
    module_qc_pdf = models.FileField(
        upload_to="kurikulum/module/", blank=True, null=True
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.nama


class MateriItemVideo(models.Model):
    materi_item_id = models.ForeignKey(
        MateriItem, on_delete=models.CASCADE, blank=True, null=True
    )
    video = models.FileField(upload_to="kurikulum/videos/", blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
