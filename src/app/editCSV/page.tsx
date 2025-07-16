"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Papa from "papaparse"

export default function EditCSV() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name")
  const url = searchParams.get("url")

  const [csvData, setCsvData] = useState<string[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCSV = async () => {
      if (!url) {
        setError("Missing file URL.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(url)
        if (!response.ok) {
          setError(`Failed to fetch file. Status: ${response.status}`)
          setLoading(false)
          return
        }

        const text = await response.text()
        const parsed = Papa.parse<string[]>(text, {
          skipEmptyLines: true,
          delimiter: ";", // adjust if needed
          error: (err) => setError("CSV parse error: " + err.message),
        })

        if (!parsed.data || parsed.data.length === 0) {
          setError("No CSV data found.")
        } else {
          setCsvData(parsed.data)
        }
      } catch (err: any) {
        setError("Error loading CSV: " + err.message)
      }

      setLoading(false)
    }

    fetchCSV()
  }, [url])

  return (
    <main className="p-6 max-w-6xl mx-auto min-h-screen bg-white text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Editing: {name}</h1>

      {loading && <p>Loading CSV...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && csvData.length > 0 && (
        <div className="overflow-auto max-h-[600px] border border-gray-300 rounded shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {csvData[0].map((header, idx) => (
                  <th key={idx} className="p-3 border border-gray-300 text-left font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="even:bg-gray-50 hover:bg-gray-100">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-3 border border-gray-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
