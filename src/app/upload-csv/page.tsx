"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function UploadCSV() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile && uploadedFile.name.endsWith(".csv")) {
      setFile(uploadedFile)
      setMessage("")
    } else {
      setMessage("Please select a valid .csv file.")
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage("No file selected.")
      return
    }

    setUploading(true)

    // Get the current user's ID
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const id = userData?.user?.id

    if (userError || !id) {
      setMessage("Unable to retrieve user ID.")
      setUploading(false)
      return
    }

    // File path format: id/timestamp_filename.csv
    const timestamp = Date.now()
    const filePath = `${id}/${timestamp}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("upload-csv")
      .upload(filePath, file)

    if (uploadError) {
      setMessage("Upload failed: " + uploadError.message)
      setUploading(false)
      return
    }

    setMessage("✅ Upload successful!")
    setUploaded(true)
    setUploading(false)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Upload CSV File</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      {file && <p className="text-sm text-gray-700 mb-2">Selected: {file.name}</p>}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}

      {uploaded && (
        <button
          onClick={() => router.push("/my-files")}
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          View Dashboard
        </button>
      )}
    </main>
  )
}
