from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from . import models
from . import serializers
from django.db.models import Q
from .pagination import StandardResultsSetPagination


class CurriculumOverviewAPIView(APIView):
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        kurikulum_id = request.query_params.get("kurikulum_id")
        fase_id = request.query_params.get("fase_id")
        kelas_id = request.query_params.get("jenjang_id")
        search = request.query_params.get("search", "").strip()

        materi_qs = models.Materi.objects.select_related(
            "kurikulum_id", "fase_id", "kelas_id"
        ).prefetch_related(
            "tujuan_pembelajaran_id",
            "kurikulum_id__element_set",
        )

        if kurikulum_id:
            materi_qs = materi_qs.filter(kurikulum_id=kurikulum_id)
        if fase_id:
            materi_qs = materi_qs.filter(fase_id=fase_id)
        if kelas_id:
            materi_qs = materi_qs.filter(kelas_id=kelas_id)
        if search:
            materi_qs = materi_qs.filter(
                Q(nama__icontains=search)
                | Q(tujuan_pembelajaran_id__nama__icontains=search)
                | Q(kurikulum_id__element_set__nama__icontains=search)
            ).distinct()

        results = []
        for materi in materi_qs:
            elements = (
                materi.kurikulum_id.element_set.all() if materi.kurikulum_id else []
            )
            if not elements:
                elements = [None]

            for element in elements:
                for tp in materi.tujuan_pembelajaran_id.all():
                    results.append(
                        {
                            "element": element,
                            "tujuan_pembelajaran": tp,
                            "materi": materi,
                        }
                    )

        paginator = self.pagination_class()
        paginated = paginator.paginate_queryset(results, request)
        serializer = serializers.CurriculumOverviewSerializer(paginated, many=True)
        return paginator.get_paginated_response(serializer.data)


class FilterOptionsAPIView(APIView):
    def get(self, request):
        kurikulum_id = request.query_params.get("kurikulum_id")

        kurikulums = models.Kurikulum.objects.all()
        kurikulum_serializer = serializers.KurikulumSerializer(kurikulums, many=True)

        if kurikulum_id:
            try:
                kurikulum = models.Kurikulum.objects.get(id=kurikulum_id)
                fases = kurikulum.fase_id.all()
            except models.Kurikulum.DoesNotExist:
                fases = models.Fase.objects.none()
        else:
            fases = models.Fase.objects.all()

        fase_serializer = serializers.FaseSerializer(fases, many=True)

        return Response(
            {"kurikulums": kurikulum_serializer.data, "fases": fase_serializer.data}
        )


class NonPaginatedSelectKurikulumViewSets(viewsets.ModelViewSet):
    queryset = models.Kurikulum.objects.all().order_by("-created_at")
    serializer_class = serializers.KurikulumSerializer


class NonPaginatedSelectFaseViewSets(viewsets.ModelViewSet):
    queryset = models.Fase.objects.all().order_by("-created_at")
    serializer_class = serializers.SelectFaseSerializer


class MateriItemsByMateriAPIView(APIView):
    def get(self, request):
        materi_id = request.query_params.get("materi_id")
        if not materi_id:
            return Response({"error": "materi_id is required"}, status=400)

        try:
            materi = models.Materi.objects.get(id=materi_id)
        except models.Materi.DoesNotExist:
            return Response({"error": "Materi not found"}, status=404)

        materi_items = models.MateriItem.objects.filter(
            materi_id=materi
        ).prefetch_related("materiitemvideo_set")

        serializer = serializers.MateriItemSerializer(materi_items, many=True)
        return Response(serializer.data)


class NonPaginatedSelectKelasViewSets(viewsets.ModelViewSet):
    queryset = models.Kelas.objects.all().order_by("-created_at")
    serializer_class = serializers.SelectKelasSerializer
