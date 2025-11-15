"use client"

export default function ForceLogoutModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Force Logout</h2>
        <p className="text-slate-600 mb-6">Select a session to force logout.</p>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}
