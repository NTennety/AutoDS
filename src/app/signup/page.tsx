"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Signup() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Step 1: Auth sign up
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      return
    }

    // Step 2: Fetch current user
    const { data: currentUser, error: userFetchError } = await supabase.auth.getUser()

    if (userFetchError || !currentUser?.user) {
      setError("Signup succeeded but user info could not be retrieved.")
      return
    }

    const user = currentUser.user

    // Step 3: Insert user into DB
    const { error: insertError } = await supabase.from("User").insert({
      id: user.id,
      email_id: email,
      first_name: firstName,
      last_name: lastName,
      created_at: new Date().toISOString(), // Omit if handled via DEFAULT
    })

    if (insertError) {
      setError("Profile setup failed: " + insertError.message)
      return
    }

    // Step 4: Redirect
    router.push("/")
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  )
}
