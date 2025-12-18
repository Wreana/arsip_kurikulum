from rest_framework import serializers
from . import models


class KurikulumSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Kurikulum
        fields = ["id", "nama"]


class SelectKelasSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Kelas
        fields = ["id", "jenjang", "kelas"]


class MateriItemVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MateriItemVideo
        fields = ["id", "video"]


class MateriItemSerializer(serializers.ModelSerializer):
    videos = MateriItemVideoSerializer(
        many=True, read_only=True, source="materiitemvideo_set"
    )

    class Meta:
        model = models.MateriItem
        fields = [
            "id",
            "nama",
            "deskripsi",
            "qc_approve",
            "module_qc",
            "module_qc_pdf",
            "videos",
            "created_at",
        ]


class SelectFaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Fase
        fields = ["id", "fase", "deskripsi"]


class FaseSerializer(serializers.ModelSerializer):
    kelas = serializers.CharField(source="kelas_id.kelas", read_only=True)
    jenjang = serializers.CharField(source="kelas_id.jenjang", read_only=True)

    class Meta:
        model = models.Fase
        fields = ["id", "fase", "kelas", "jenjang", "deskripsi"]


class ElementSerializer(serializers.ModelSerializer):
    kurikulum = KurikulumSerializer(source="kurikulum_id", read_only=True)

    class Meta:
        model = models.Element
        fields = ["id", "nama", "deskripsi", "kurikulum"]


class TujuanPembelajaranSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TujuanPembelajaran
        fields = ["id", "nama", "flow_number"]


class MateriSerializer(serializers.ModelSerializer):
    kurikulum = KurikulumSerializer(source="kurikulum_id", read_only=True)
    fase = FaseSerializer(source="fase_id", read_only=True)
    tujuan_pembelajaran = TujuanPembelajaranSerializer(
        source="tujuan_pembelajaran_id", many=True, read_only=True
    )
    kelas = SelectKelasSerializer(source="kelas_id", read_only=True)

    class Meta:
        model = models.Materi
        fields = [
            "id",
            "nama",
            "rpp",
            "kurikulum",
            "fase",
            "tujuan_pembelajaran",
            "kelas",
        ]


class SelectKelasSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Kelas
        fields = ["id", "kelas", "jenjang"]


class CurriculumOverviewSerializer(serializers.Serializer):
    element = ElementSerializer()
    tujuan_pembelajaran = TujuanPembelajaranSerializer()
    materi = MateriSerializer()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data
