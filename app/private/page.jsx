"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SessionManagement from "@/components/session-management"
import PhoneCollectionModal from "@/components/phone-collection-modal"
import ForcedLogoutOverlay from "@/components/forced-logout-overlay"

export default function PrivatePage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showForcedOverlay, setShowForcedOverlay] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await fetch("/api/sessions/validate")
        const data = await res.json()

        if (!data.valid) {
          // If not valid but user is logged into Auth0, try to create app session
          if (data.reason !== "forced_out") {
            console.log("No valid app session, attempting to create one...")
            try {
              const createRes = await fetch("/api/auth/create-app-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              })
              
              if (createRes.ok) {
                console.log("App session created, retrying validation...")
                // Retry validation after creating app session
                const retryRes = await fetch("/api/sessions/validate")
                const retryData = await retryRes.json()
                if (retryData.valid) {
                  setSession(retryData.session)
                  // Continue with user fetch
                  const userRes = await fetch("/api/auth/me")
                  if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData)
                  }
                  setLoading(false)
                  return
                }
              }
            } catch (e) {
              console.error("Failed to create app session:", e)
            }
          }
          
          if (data.reason === "forced_out") {
            setShowForcedOverlay(true)
          } else {
            router.push("/api/auth/logout")
          }
          return
        }

        setSession(data.session)

        if (!data.session.phone) {
          setShowPhoneModal(true)
        }

        // Get user profile
        const userRes = await fetch("/api/auth/me")
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
      } catch (e) {
        router.push("/api/auth/logout")
      } finally {
        setLoading(false)
      }
    }

    validateSession()

    // Poll for forced logout every 5 seconds
    const interval = setInterval(validateSession, 5000)
    return () => clearInterval(interval)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showForcedOverlay) {
    return <ForcedLogoutOverlay />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-900">SessionGuard</div>
          <a href="/api/auth/logout" className="text-slate-600 hover:text-slate-900 font-medium">
            Logout
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome</h1>
          <p className="text-slate-600">
            {user?.name || "User"}
            {session?.phone && ` • ${session.phone}`}
          </p>
        </div>

        <SessionManagement session={session} />
      </main>

      {showPhoneModal && <PhoneCollectionModal onClose={() => setShowPhoneModal(false)} />}
    </div>
  )
}
