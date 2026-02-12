"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Register failed. (Your backend may not have /api/auth/register yet.)");
        return;
      }

      setOk("Account created! Logging you in...");
      // auto login
      const loginRes = await signIn("credentials", { redirect: false, email, password });
      if (loginRes?.error) {
        window.location.href = "/login";
        return;
      }
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    setError("");
    const result = await signIn(provider, { callbackUrl: "/dashboard" });
    if (result?.error) setError("Social login failed or not configured.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-white/70 mt-1">Register to start tracking meals.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocial("google")}
            className="rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-3 border border-white/10 transition"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocial("github")}
            className="rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-3 border border-white/10 transition"
          >
            GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-white/60">or register with email</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-4">
            {error}
          </div>
        )}

        {ok && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200 mb-4">
            {ok}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/80">Name</label>
            <input
              className="w-full rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Email</label>
            <input
              className="w-full rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-white/20"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Password</label>
            <input
              className="w-full rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-white/20"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-3 font-semibold transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-white/70 mt-6">
          Already have an account?{" "}
          <Link className="text-white underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
