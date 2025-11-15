"use client"

import { useState } from "react"

export default function PhoneCollectionModal({ onClose }) {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validatePhone = (value) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(value.replace(/[^\d+]/g, ""))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!phone.trim()) {
      setError("Phone number is required")
      return
    }

    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number (E.164 format)")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/save-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      if (res.ok) {
        onClose()
      } else {
        setError("Failed to save phone number")
      }
    } catch (e) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Add Phone Number</h2>
        <p className="text-slate-600 mb-6">For security purposes, please provide your phone number.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Phone Number (E.164 Format)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
