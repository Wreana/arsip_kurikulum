
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

interface Video {
  id: number
  video: string
}

interface MateriItem {
  id: number
  nama: string
  module_qc: string | null
  module_qc_pdf: string | null
  videos: Video[]
}

export default function ModuleViewerPage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [fileType, setFileType] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFile = () => {
      try {
        setLoading(true)
        setError(null)

        const cached = localStorage.getItem("selected_module")
        if (!cached) {
          throw new Error("No module selected")
        }

        const { item, fileType }: { item: MateriItem; fileType: "qc" | "pdf" } = JSON.parse(cached)
        setFileType(fileType)
        let url: string | null = null
        let name = ""

        if (fileType === "qc" && item.module_qc) {
          url = item.module_qc.trim()
          name = item.module_qc.split("/").pop()?.trim() || "Module QC"
        } else if (fileType === "pdf" && item.module_qc_pdf) {
          url = item.module_qc_pdf.trim()
          name = item.module_qc_pdf.split("/").pop()?.trim() || "Module PDF"
        } else {
          throw new Error(`File not available`)
        }

        if (!url) throw new Error("Invalid file URL")

        setFileUrl(url)
        setFileName(name)
      } catch (err: any) {
        console.error("Failed to load module:", err)
        setError(err.message || "Failed to load document")
      } finally {
        setLoading(false)
      }
    }

    loadFile()
  }, [])

  const goBack = () => window.history.back()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[80vh] w-full" />
        </div>
      </div>
    )
  }

  if (error || !fileUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Document</h2>
          <p className="text-gray-600 mb-6">{error || "File not available"}</p>
          <Button onClick={goBack} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Materi
          </Button>
          <h1 className="text-lg font-semibold text-gray-800 truncate max-w-md">
            {fileName}
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Viewer */}
      <div className="h-[calc(100vh-72px)] w-full">
        <div className="h-[calc(100vh-72px)] w-full">
          {fileType === "pdf" && (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
            />
          )}

          {fileType === "qc" && (
            <a
              href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost">Open in Google Viewer</Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
