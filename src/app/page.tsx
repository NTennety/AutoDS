"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const router = useRouter()

  const handleViewFiles = async () => {
    const { data: userData, error } = await supabase.auth.getUser()
    const id = userData?.user?.id

    if (error || !id) {
      console.warn("🔒 Not authenticated — redirecting to login")
      router.push("/login")
    } else {
      console.log("✅ Authenticated — redirecting to my-files")
      router.push("/my-files")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full p-4 flex justify-end space-x-4 bg-white shadow">
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition"
        >
          Sign Up
        </button>
      </header>

      <main className="flex flex-col flex-grow items-center justify-center p-4">
        <h1 className="text-4xl font-bold">📊 AutoDS</h1>
        <p className="mt-2 text-lg text-center text-gray-600">
          Upload your CSV files and effortlessly manipulate data for insights, automation, and exploration.
        </p>
        <p className="mt-4 text-md text-center text-gray-500 max-w-xl">
          Whether you're cleaning datasets, transforming schemas, or visualizing large data batches—AutoDS helps streamline your workflow with intuitive tools and real-time feedback.
        </p>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => router.push("/upload-csv")}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Upload CSV
          </button>
          <button
            onClick={handleViewFiles}
            className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            View My Files
          </button>
        </div>
      </main>
    </div>
  )
}
