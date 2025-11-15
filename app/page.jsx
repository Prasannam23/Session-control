"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PublicPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/sessions/validate")
        const data = await res.json()
        setIsAuthenticated(data.valid)
      } catch (e) {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-900">SessionGuard</div>
          {isAuthenticated && (
            <Link href="/private" className="text-blue-600 hover:text-blue-700 font-medium">
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 text-balance">Secure Device Management</h1>
            <p className="text-xl text-slate-600 text-balance">
              Control your account access with intelligent device session limits. Stay secure by limiting concurrent
              logins to just 3 devices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 py-12">
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-left">
              <h3 className="font-semibold text-slate-900">Max Devices</h3>
              <p className="text-slate-600 text-sm mt-2">Stay in control with a 3-device concurrent login limit</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-left">
              <h3 className="font-semibold text-slate-900">Force Logout</h3>
              <p className="text-slate-600 text-sm mt-2">Remove suspicious sessions instantly from any device</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-left">
              <h3 className="font-semibold text-slate-900">Real-time</h3>
              <p className="text-slate-600 text-sm mt-2">Immediate notifications when your account is accessed</p>
            </div>
          </div>

          <div className="pt-8">
            {isAuthenticated ? (
              <Link
                href="/private"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <a
                href="/api/auth/login?returnTo=/auth-callback"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Login with Auth0
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
