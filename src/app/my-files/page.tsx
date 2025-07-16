"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface CSVFile {
  name: string
  path: string
  url: string
}

export default function MyFiles() {
  const [files, setFiles] = useState<CSVFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchFiles = async () => {
      console.log("🔍 Fetching user...")
      const { data: userData, error: userError } = await supabase.auth.getUser()
      const id = userData?.user?.id

      if (userError || !id) {
        console.error("❌ User fetch error:", userError?.message)
        router.push("/login")
        return
      }

      console.log("✅ User ID:", id)

      console.log("📂 Listing files in bucket: upload-csv")
      const { data, error } = await supabase.storage.from("upload-csv").list(id, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      })

      if (error) {
        console.error("❌ Error listing files:", error.message)
        setError("Could not list files.")
        setLoading(false)
        return
      }

      const filesWithUrls: CSVFile[] = await Promise.all(
        (data || []).map(async (file) => {
          const fullPath = `${id}/${file.name}`
          const { data: urlData, error: urlError } = await supabase.storage
            .from("upload-csv")
            .createSignedUrl(fullPath, 60 * 10)

          if (urlError) {
            console.error("❌ Signed URL error for", file.name, ":", urlError.message)
          }

          return {
            name: file.name,
            path: fullPath,
            url: urlData?.signedUrl || "",
          }
        })
      )

      console.log("✅ Files with URLs:", filesWithUrls)
      setFiles(filesWithUrls)
      setLoading(false)
    }

    fetchFiles()
  }, [router])

  const handleEditCSV = (file: CSVFile) => {
    const encodedUrl = encodeURIComponent(file.url)
    const encodedName = encodeURIComponent(file.name)
    router.push(`/editCSV?name=${encodedName}&url=${encodedUrl}`)
  }

  return (
    <main className="p-6 max-w-5xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Uploaded CSV Files</h1>

      {loading ? (
        <p>Loading files...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : files.length === 0 ? (
        <p>
          No CSV files found.{" "}
          <button className="text-blue-600 underline" onClick={() => router.push("/upload")}>
            Upload one
          </button>.
        </p>
      ) : (
        <ul className="space-y-4">
          {files.map((file) => (
            <li key={file.name} className="flex justify-between items-center p-4 border rounded shadow">
              <span>{file.name}</span>
              <button
                onClick={() => handleEditCSV(file)}
                className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 transition"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
