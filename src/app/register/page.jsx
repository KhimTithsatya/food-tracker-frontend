"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import AnimatedInput from "../../components/auth/AnimatedInput";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE || (process.env.NODE_ENV === "development" ? "http://localhost:5001" : "");

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialProviders, setSocialProviders] = useState(["google", "github"]);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await getProviders();
        const names = ["google", "github"];
        const available = names.filter((name) => providers?.[name]);
        setSocialProviders(available.length ? available : names);
      } catch {
        setSocialProviders(["google", "github"]);
      }
    };
    loadProviders();
  }, []);

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
    const result = await signIn(provider, { callbackUrl: `/auth/social-success?provider=${provider}` });
    if (result?.error) setError("Social login failed or not configured.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo-main.png"
              alt="My Healthy Bowl logo"
              width={72}
              height={72}
              className="h-18 w-18 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-white/70 mt-1">Register to start tracking meals.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {socialProviders.includes("google") && (
              <button
                type="button"
                onClick={() => handleSocial("google")}
                className="rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-3 border border-white/10 transition flex items-center justify-center gap-2"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
            )}
            {socialProviders.includes("github") && (
              <button
                type="button"
                onClick={() => handleSocial("github")}
                className="rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-3 border border-white/10 transition flex items-center justify-center gap-2"
              >
                <GitHubIcon />
                <span>GitHub</span>
              </button>
            )}
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
          <AnimatedInput
            id="register-name"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

          <AnimatedInput
            id="register-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <AnimatedInput
            id="register-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.9 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"/>
      <path fill="#34A853" d="M2 12c0 3.9 2.3 7.2 5.7 8.8l3-2.5c-.8-.2-3.7-1.1-4.7-3.9H2z"/>
      <path fill="#4A90E2" d="M12 22c2.7 0 4.9-.9 6.5-2.4l-3.2-2.5c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4.1l-3.1 2.4C5.1 19.6 8.3 22 12 22z"/>
      <path fill="#FBBC05" d="M6.6 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3.5 7.6C2.9 8.8 2.5 10.3 2.5 12s.4 3.2 1 4.4l3.1-2.5z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
      <path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.8 11 .6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 .1a10.2 10.2 0 0 1 5.4 0c2.1-.4 3-.1 3-.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.6 18.4.5 12 .5z"/>
    </svg>
  );
}
