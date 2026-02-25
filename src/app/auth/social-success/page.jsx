"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function SocialSuccessPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      window.location.href = "/login";
      return;
    }

    const exchangeToken = async () => {
      try {
        setError("");
        const email = session?.user?.email;
        const name = session?.user?.name || "";
        const provider =
          new URLSearchParams(window.location.search).get("provider") || "google";

        if (!email) {
          throw new Error("Could not read email from social account");
        }

        const res = await fetch(`${API_BASE}/api/auth/social-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, provider }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || "Social login exchange failed");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user?.role || "USER");

        const role = String(data.user?.role || "USER").toUpperCase();
        window.location.href = role === "ADMIN" ? "/admin" : "/dashboard";
      } catch (err) {
        console.error(err);
        setError(err.message || "Social login failed");
      }
    };

    exchangeToken();
  }, [session, status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 text-white">
        {!error ? (
          <>
            <h1 className="text-xl font-bold">Completing sign in...</h1>
            <p className="text-sm text-white/70 mt-2">
              Please wait while we finish your social login.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-red-200">Social login failed</h1>
            <p className="text-sm text-white/70 mt-2">{error}</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-semibold transition"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold transition"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
