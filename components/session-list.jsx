"use client"

export default function SessionList({ sessions, currentSessionId, onForceLogout }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getDeviceIcon = (userAgent) => {
    if (userAgent.includes("Windows")) return "💻"
    if (userAgent.includes("Mac")) return "🍎"
    if (userAgent.includes("Linux")) return "🐧"
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "📱"
    if (userAgent.includes("Android")) return "📱"
    return "🖥️"
  }

  if (!sessions.length) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-600">No active sessions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div
          key={s.sessionId}
          className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="text-2xl">{getDeviceIcon(s.userAgent)}</div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{s.deviceName || "Unknown Device"}</div>
              <div className="text-sm text-slate-600">
                {s.ip} • {formatDate(s.createdAt)}
              </div>
            </div>
            {s.sessionId === currentSessionId && (
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                This Device
              </span>
            )}
          </div>
          {s.sessionId !== currentSessionId && (
            <button
              onClick={() => onForceLogout(s.sessionId)}
              className="ml-4 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Logout
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
