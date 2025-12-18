"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BANK_MATERI_ITEMS_BY_ID } from "@/utils/endpoint"

interface Kurikulum {
  id: number
  nama: string
}

interface Fase {
  id: number
  fase: string
  deskripsi: string
}

interface TujuanPembelajaran {
  id: number
  nama: string
}

interface Materi {
  id: number
  nama: string
  rpp: string | null
  flow_number: string | null
  created_at: string
  kurikulum: Kurikulum
  fase: Fase
  tujuan_pembelajaran: TujuanPembelajaran[]
}

interface Video {
  id: number
  video: string
}

interface MateriItem {
  id: number
  nama: string
  deskripsi: string
  qc_approve: boolean
  module_qc: string | null
  module_qc_pdf: string | null
  videos: Video[]
  created_at: string
}

export default function MateriDetailPage() {
  const router = useRouter()
  const params = useParams()
  const materiId = params?.id

  const [materi, setMateri] = useState<Materi | null>(null)
  const [materiItems, setMateriItems] = useState<MateriItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!materiId) {
      setLoading(false)
      setError("Materi ID not found")
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const cached = localStorage.getItem("inquiry_cache")
        if (!cached) {
          throw new Error("Materi data not found in cache")
        }

        const materiData = JSON.parse(cached)

        if (materiData.id?.toString() !== materiId.toString()) {
          throw new Error("Cached materi ID does not match")
        }

        setMateri(materiData)

        const itemsRes = await fetch(`${BANK_MATERI_ITEMS_BY_ID}?materi_id=${materiId}`)
        if (!itemsRes.ok) throw new Error("Failed to fetch materi items")
        const itemsData: MateriItem[] = await itemsRes.json()
        setMateriItems(itemsData)
      } catch (err: any) {
        console.error("Load failed:", err)
        setError(err.message || "Failed to load materi details")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [materiId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error || !materi) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white mb-6"
          >
            ← Back to Table
          </Button>
          <div className="text-center py-12 text-red-600">
            {error || "Materi data not available"}
          </div>
        </div>
      </div>
    )
  }

  const modulePreview = (item: any, fileType: "qc" | "pdf") => {
    localStorage.setItem("selected_module", JSON.stringify({
      item,
      fileType
    }))
    router.push("/materi/module-preview")
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Table
            </Button>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-[#00ADB5]">{materi.nama}</h1>
          <p className="text-gray-600">Detailed view of materi and all associated items</p>
        </div>

        <Card className="mb-6 overflow-hidden border-[#00ADB5] bg-white">
          <div className="border-b border-gray-200 bg-[#00ADB5] px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Materi Information</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Kurikulum</label>
                  <Badge variant="secondary" className="bg-[#FFCB00] text-gray-800">
                    {materi.kurikulum.nama}
                  </Badge>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Nama Materi</label>
                  <p className="text-base text-gray-900">{materi.nama}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Fase</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#00ADB5] text-[#00ADB5]">
                      Fase {materi.fase.fase}
                    </Badge>
                    <span className="text-sm text-gray-600">{materi.fase.deskripsi}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Flow Number</label>
                  <p className="text-base text-gray-900">{materi.flow_number || "—"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Tujuan Pembelajaran</label>
                  <div className="space-y-2">
                    {materi.tujuan_pembelajaran.map((tp) => (
                      <div key={tp.id} className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#00ADB5]" />
                        <span className="text-sm text-gray-900">{tp.nama}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">RPP File</label>
                  {materi.rpp ? (
                    <a
                      href={materi.rpp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#00ADB5] bg-[#00ADB5]/5 px-3 py-2 text-sm text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {materi.rpp.split("/").pop()}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">No RPP uploaded</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Created At</label>
                  <p className="text-sm text-gray-600">{formatDate(materi.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Materi Items Card */}
        <Card className="overflow-hidden border-[#00ADB5] bg-white">
          <div className="border-b border-gray-200 bg-[#00ADB5] px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Materi Items</h2>
              <Badge variant="secondary" className="bg-white text-[#00ADB5]">
                {materiItems.length} Items
              </Badge>
            </div>
          </div>
          <div className="p-6">
            {materiItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No materi items found.</p>
            ) : (
              <div className="space-y-4">
                {materiItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-lg border-2 border-gray-200 bg-white p-5 transition-all hover:border-[#00ADB5] hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00ADB5] text-sm font-bold text-white">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">{item.nama}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">{item.deskripsi}</p>
                      </div>
                      <div className="ml-4">
                        {item.qc_approve ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            QC Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            Pending QC
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-gray-200 pt-4 md:grid-cols-2">
                      {item.module_qc && (
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Module QC</label>
                          <a
                            href={`https://docs.google.com/gview?url=${encodeURIComponent(item.module_qc)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-[#00ADB5] hover:underline focus:outline-none"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {item.module_qc.split("/").pop()}
                          </a>
                        </div>
                      )}

                      {item.module_qc_pdf && (
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Module PDF</label>
                          <button
                            type="button"
                            onClick={() => modulePreview(item, "pdf")}
                            className="inline-flex items-center gap-1.5 text-sm text-[#00ADB5] hover:underline focus:outline-none"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            {item.module_qc_pdf.split("/").pop()}
                          </button>
                        </div>
                      )}

                      {item.videos.length > 0 && (
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Videos</label>
                          <div className="flex flex-wrap gap-2">
                            {item.videos.map((video) => (
                              <a
                                key={video.id}
                                href={video.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[#00ADB5] hover:underline"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                {video.video.split("/").pop()}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Created At</label>
                        <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
