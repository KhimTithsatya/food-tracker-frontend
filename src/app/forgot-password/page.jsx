"use client";

import Link from "next/link";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [debugResetUrl, setDebugResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDebugResetUrl("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to request password reset");
        setLoading(false);
        return;
      }

      setMessage(data.message || "If an account exists, a reset link has been generated.");
      if (data.debugResetUrl) {
        setDebugResetUrl(data.debugResetUrl);
      }
    } catch (_err) {
      setError("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-white">Forgot password</h1>
        <p className="text-sm text-white/70 mt-1">Enter your email to generate a reset link.</p>

        {message && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 mt-4">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 mt-4">
            {error}
          </div>
        )}

        {debugResetUrl && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 mt-4">
            Dev reset link:{" "}
            <a href={debugResetUrl} className="underline break-all">
              {debugResetUrl}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <label className="text-sm text-white/80">Email</label>
            <input
              className="w-full rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-white/20"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-3 font-semibold transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-sm text-white/70 mt-6">
          Back to{" "}
          <Link className="text-white underline" href="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
