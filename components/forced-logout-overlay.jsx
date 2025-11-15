"use client"

export default function ForcedLogoutOverlay() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center space-y-6">
        <div className="text-5xl">🔒</div>
        <h1 className="text-2xl font-bold text-slate-900">Account Logged Out</h1>
        <p className="text-slate-600">
          Your account was logged out on this device because it was signed in from another location. This may have been
          initiated by you or an administrator.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <p className="font-semibold mb-2">For your security:</p>
          <ul className="space-y-1 text-left list-disc list-inside">
            <li>Consider changing your password if this was unexpected</li>
            <li>Review your active sessions regularly</li>
            <li>Use a strong, unique password</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 pt-4">
          <a
            href="/api/auth/login"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Login Again
          </a>
          <a
            href="/"
            className="w-full py-2 px-4 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  )
}
