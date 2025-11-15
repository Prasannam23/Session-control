"use client"

import { useState } from "react"
import SessionList from "./session-list"
import ForceLogoutModal from "./force-logout-modal"

export default function SessionManagement({ session }) {
  const [showForceModal, setShowForceModal] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  const loadSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/sessions/list")
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch (e) {
      console.error("Failed to load sessions", e)
    } finally {
      setLoading(false)
    }
  }

  const handleForceLogout = async (sessionId) => {
    try {
      const res = await fetch("/api/sessions/force", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (res.ok) {
        loadSessions()
        setShowForceModal(false)
      }
    } catch (e) {
      console.error("Force logout failed", e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Active Sessions</h2>
        <button
          onClick={loadSessions}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <SessionList
        sessions={sessions}
        currentSessionId={session?.sessionId}
        onForceLogout={(sessionId) => {
          if (sessionId !== session?.sessionId) {
            handleForceLogout(sessionId)
          }
        }}
      />

      {showForceModal && <ForceLogoutModal onClose={() => setShowForceModal(false)} />}
    </div>
  )
}
