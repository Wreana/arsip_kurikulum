"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BANK_MATERI, FILTER_OPTION_BANK_MATERI, JENJANG_FILTER } from "@/utils/endpoint"
import { useRouter } from "next/navigation"

// Define TypeScript interfaces
interface ElementData {
  id: number
  nama: string
  deskripsi: string | null
}

interface TujuanPembelajaranData {
  id: number
  nama: string
  flow_number: string
}

interface MateriItemData {
  id: number
  nama: string
  deskripsi: string
}

interface MateriData {
  id: number
  nama: string
  flow_number: string | null
  rpp: string | null
  kurikulum: {
    id: number
    nama: string
  }
  fase: {
    id: number
    fase: string
  }
  materiItems: MateriItemData[]
}

interface CurriculumRow {
  element: ElementData | null
  tujuan_pembelajaran: TujuanPembelajaranData
  materi: MateriData
}

interface FilterOption {
  id: number
  nama: string
}

interface FaseOption {
  id: number
  fase: string
}

interface JenjangOption {
  id: number
  jenjang: string
}

export default function CurriculumTable() {
  const router = useRouter()
  const [selectedKurikulum, setSelectedKurikulum] = useState<string>("all")
  const [selectedFase, setSelectedFase] = useState<string>("all")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [data, setData] = useState<CurriculumRow[]>([])
  const [loading, setLoading] = useState(true)
  const [kurikulumOptions, setKurikulumOptions] = useState<FilterOption[]>([])
  const [faseOptions, setFaseOptions] = useState<FaseOption[]>([])
  const [jenjangOptions, setJenjangOptions] = useState<JenjangOption[]>([])
  const [selectedJenjang, setSelectedJenjang] = useState<string>("all")
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kurikulumRes, jenjangRes] = await Promise.all([
          fetch(FILTER_OPTION_BANK_MATERI),
          fetch(JENJANG_FILTER),
        ])

        const [kurikulumJson, jenjangJson] = await Promise.all([
          kurikulumRes.json(),
          jenjangRes.json(),
        ])

        setKurikulumOptions(kurikulumJson.kurikulums)
        setJenjangOptions(jenjangJson)
      } catch (err) {
        console.error("Failed to fetch data", err)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchFases = async () => {
      try {
        let url = FILTER_OPTION_BANK_MATERI
        if (selectedKurikulum !== "all") {
          url += `?kurikulum_id=${selectedKurikulum}`
        }

        const res = await fetch(url)
        const json = await res.json()
        setFaseOptions(json.fases)
      } catch (err) {
        console.error("Failed to fetch fases", err)
        setFaseOptions([])
      }
    }

    fetchFases()
  }, [selectedKurikulum])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const params = new URLSearchParams()

      if (selectedKurikulum !== "all") {
        params.append("kurikulum_id", selectedKurikulum)
      }
      if (selectedFase !== "all") {
        params.append("fase_id", selectedFase)
      }
      if (selectedJenjang !== "all") {
        params.append("jenjang_id", selectedJenjang)
      }
      params.append("page", "1")

      try {
        const res = await fetch(`${BANK_MATERI}?${params}`)
        const json = await res.json()

        setData(json.results || [])
        setPagination({
          count: json.count || 0,
          next: json.next,
          previous: json.previous,
          currentPage: 1,
        })
      } catch (err) {
        console.error("Failed to fetch curriculum data", err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedKurikulum, selectedFase, selectedJenjang])

  const toggleRow = (values: any) => {
    localStorage.setItem("inquiry_cache", JSON.stringify(values))
    router.push(`/materi/${values.id}`)
  }

  const goToPage = async (url: string | null) => {
    if (!url) return
    setLoading(true)
    try {
      const res = await fetch(url)
      const json = await res.json()
      setData(json.results || [])

      const pageMatch = url.match(/[?&]page=(\d+)/)
      const currentPage = pageMatch ? parseInt(pageMatch[1], 10) : 1

      setPagination({
        count: json.count || 0,
        next: json.next,
        previous: json.previous,
        currentPage,
      })
    } catch (err) {
      console.error("Pagination error", err)
    } finally {
      setLoading(false)
    }
  }

  // Helper to get RPP filename
  const getRppFilename = (rppUrl: string | null) => {
    if (!rppUrl) return "No file"
    return rppUrl.split("/").pop() || "Download"
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[#00ADB5]">Kurikulum Management</h1>
          <p className="text-gray-600">Manage curriculum elements, learning objectives, and materials</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-[#00ADB5] bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1 w-8 bg-[#00ADB5]" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Kurikulum</label>
              <Select value={selectedKurikulum} onValueChange={setSelectedKurikulum}>
                <SelectTrigger className="border-gray-300 focus:border-[#00ADB5] focus:ring-[#00ADB5]">
                  <SelectValue placeholder="Select kurikulum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Kurikulum</SelectItem>
                  {kurikulumOptions?.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Fase</label>
              <Select value={selectedFase} onValueChange={setSelectedFase}>
                <SelectTrigger className="border-gray-300 focus:border-[#00ADB5] focus:ring-[#00ADB5]">
                  <SelectValue placeholder="Select fase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fase</SelectItem>
                  {faseOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.fase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Jenjang</label>
              <Select value={selectedJenjang} onValueChange={setSelectedJenjang}>
                <SelectTrigger className="border-gray-300 focus:border-[#00ADB5] focus:ring-[#00ADB5]">
                  <SelectValue placeholder="Select fase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jenjang</SelectItem>
                  {jenjangOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.jenjang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-[#00ADB5] bg-white">
          <div className="border-b border-gray-200 bg-[#00ADB5] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">Curriculum Overview</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Tujuan Pembelajaran
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                      Element
                    </th>
                    <th colSpan={5} className="px-4 py-3 text-center text-sm font-semibold text-[#00ADB5] bg-[#00ADB5]/5">
                      Materi
                    </th>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-100">
                    <th className="px-4 py-2 border-r border-gray-300"></th>
                    <th className="px-4 py-2 border-r border-gray-300"></th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200">
                      Nama
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200">
                      Kurikulum
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200">
                      Fase
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200">
                      RPP
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No data found matching the selected filters
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      const rowId = item.materi.id + index // Unique per row
                      return (
                        <>
                          <tr
                            key={rowId}
                            className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                              }`}
                          >
                            <td className="px-4 py-3 border-r border-gray-300">
                              <div className="text-sm text-gray-900">
                                <span className="inline-flex items-center rounded-full bg-[#FFCB00] px-2 py-0.5 text-xs font-medium text-blue-800">
                                  {item.tujuan_pembelajaran.flow_number}
                                </span>
                                {""} {item.tujuan_pembelajaran.nama}
                              </div>
                            </td>

                            <td className="px-4 py-3 border-r border-gray-200">
                              {item.element ? (
                                <>
                                  <div className="text-sm font-medium text-gray-900">{item.element.nama}</div>
                                  <div className="text-xs text-gray-500">{item.element.deskripsi || "–"}</div>
                                </>
                              ) : (
                                <div className="text-sm text-gray-500">–</div>
                              )}
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              <div className="text-sm font-medium text-gray-900">{item.materi.nama}</div>
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              <Badge variant="secondary" className="bg-[#FFCB00] text-gray-800 hover:bg-[#FFCB00]/90">
                                {item.materi.kurikulum.nama}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              <Badge variant="outline" className="border-[#00ADB5] text-[#00ADB5]">
                                {item.materi.fase.fase}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              {item.materi.rpp ? (
                                <a
                                  href={item.materi.rpp}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-[#00ADB5] hover:underline"
                                >
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  <span className="max-w-[120px] truncate">{getRppFilename(item.materi.rpp)}</span>
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">–</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleRow(item.materi)}
                                className="border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white"
                              >
                                {expandedRows.has(rowId) ? (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </Button>
                            </td>
                          </tr>
                          {expandedRows.has(rowId) && (
                            <tr className="bg-[#00ADB5]/5">
                              <td colSpan={7} className="px-4 py-4">
                                <div className="ml-8">
                                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Materi Items:</h4>
                                  <div className="text-xs text-gray-500 italic">
                                    (Note: Materi items are not included in current API — extend serializer if needed)
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {(data.length > 0 || pagination.next || pagination.previous) && (
            <div className="flex justify-between items-center p-4 border-t">
              <Button
                onClick={() => goToPage(pagination.previous)}
                disabled={!pagination.previous || loading}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {Math.ceil(pagination.count / 20) || 1}
              </span>
              <Button
                onClick={() => goToPage(pagination.next)}
                disabled={!pagination.next || loading}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
