from django.db import models
from django.utils import timezone

KELAS_CHOICES = [
    ("SD", "SD"),
    ("SMP", "SMP"),
    ("SMA", "SMA"),
    ("SMK", "SMK"),
    ("Independent", "Independent"),
]

BAHASA_PEMROGRAMAN_CHOICES = [
    ("Scratch", "Scratch"),
    ("Thinker", "Thinker"),
    ("Pictoblock", "Pictoblock"),
    ("Roblox", "Roblox"),
    ("Python", "Python"),
    ("Java Scripts", "Java Scripts"),
]


class Kelas(models.Model):
    kelas = models.CharField(max_length=255, blank=True, null=True)
    jenjang = models.CharField(
        max_length=255, choices=KELAS_CHOICES, blank=True, null=True
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.kelas


class Fase(models.Model):
    fase = models.CharField(max_length=255, blank=True, null=True, unique=True)
    deskripsi = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.fase


class Kurikulum(models.Model):
    fase_id = models.ManyToManyField(
        Fase, blank=True, null=True, related_name="kurikulum_fase_set"
    )
    kurikulum_kode = models.CharField(max_length=255, blank=True, null=True)
    nama = models.CharField(max_length=255, blank=True, null=True)
    referensi = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.nama


class Element(models.Model):
    nama = models.CharField(max_length=255, blank=True, null=True)
    deskripsi = models.CharField(max_length=255, blank=True, null=True)
    kurikulum_id = models.ForeignKey(
        Kurikulum, on_delete=models.CASCADE, blank=True, null=True
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.nama


class Materi(models.Model):
    kelas_id = models.ForeignKey(Kelas, on_delete=models.CASCADE, blank=True, null=True)
    fase_id = models.ForeignKey(Fase, on_delete=models.CASCADE, blank=True, null=True)
    bahasa_pemrograman = models.CharField(
        max_length=255, choices=BAHASA_PEMROGRAMAN_CHOICES, blank=True, null=True
    )
    jp = models.IntegerField(default=2, blank=True, null=True)
    nama = models.CharField(max_length=255, blank=True, null=True)
    rpp = models.FileField(upload_to="kurikulum/rpp/", blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.nama


class TujuanPembelajaran(models.Model):
    kurikulum = models.ForeignKey(
        Kurikulum, on_delete=models.CASCADE, blank=True, null=True
    )
    nama = models.CharField(max_length=255, blank=True, null=True)
    flow_number = models.CharField(max_length=255, blank=True, null=True)
    materi_id = models.ManyToManyField(
        Materi, blank=True, null=True, related_name="tp_materiSet"
    )
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
