"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const initializeAppSession = async () => {
      try {
        console.log("Initializing app session...")
        const res = await fetch("/api/auth/create-app-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        if (res.ok) {
          const data = await res.json()
          console.log("App session created successfully:", data.session.sessionId)
          
          setTimeout(() => {
            router.push("/private")
          }, 500)
        } else {
          console.error("Failed to create app session:", res.status)
          router.push("/")
        }
      } catch (error) {
        console.error("Error creating app session:", error)
        router.push("/")
      }
    }

    initializeAppSession()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600">Setting up your session...</p>
      </div>
    </div>
  )
}
