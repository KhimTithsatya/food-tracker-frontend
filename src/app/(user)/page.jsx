"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function UserPage() {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // If not logged in, go back to login
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        // Try the most likely endpoint; adjust if your backend uses a different path
        const res = await fetch(`${API_BASE}/api/user/meals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // If backend doesn't have this endpoint yet, show a friendly message
          const text = await res.text();
          throw new Error(text || "Failed to load meals");
        }

        const data = await res.json();
        // Accept both array or { meals: [] } formats
        const list = Array.isArray(data) ? data : data.meals || [];
        setMeals(list);
      } catch (e) {
        setError(
          "Could not load your meals yet. (Your backend endpoint might be different.)"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const totalCalories = useMemo(() => {
    // If meal has calories field
    return meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  }, [meals]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">User Dashboard</h1>
            <p className="text-sm text-white/70">
              {user?.email ? `Signed in as ${user.email}` : "Welcome back!"}
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("role");
              window.location.href = "/login";
            }}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Meals logged"
            value={loading ? "..." : String(meals.length)}
            sub="This is your current total."
          />
          <StatCard
            title="Total calories"
            value={loading ? "..." : String(totalCalories)}
            sub="Based on loaded meals."
          />
          <StatCard
            title="Role"
            value={String(user?.role || "USER")}
            sub="Access level"
          />
        </div>

        {/* Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard
            title="Add a meal"
            desc="Log what you ate today."
            onClick={() => (window.location.href = "/user/meals/new")}
            button="Add Meal"
          />
          <ActionCard
            title="View report"
            desc="See calories summary and history."
            onClick={() => (window.location.href = "/user/report")}
            button="Open Report"
          />
          <ActionCard
            title="Settings"
            desc="Update your account preferences."
            onClick={() => (window.location.href = "/user/settings")}
            button="Open Settings"
          />
        </div>

        {/* Recent meals */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Recent meals</h2>
            <button
              onClick={() => (window.location.href = "/user/meals")}
              className="text-sm text-white/80 hover:text-white underline underline-offset-4"
            >
              View all
            </button>
          </div>

          <div className="mt-4">
            {loading && (
              <div className="text-white/70 text-sm">Loading meals...</div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
                <div className="mt-2 text-xs text-white/70">
                  If your backend route is different, tell me your meal endpoint
                  and I’ll update this page to match it.
                </div>
              </div>
            )}

            {!loading && !error && meals.length === 0 && (
              <div className="text-white/70 text-sm">
                No meals yet. Click <b>Add Meal</b> to log your first meal.
              </div>
            )}

            {!loading && !error && meals.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/80">
                    <tr>
                      <th className="text-left px-4 py-3">Meal</th>
                      <th className="text-left px-4 py-3">Calories</th>
                      <th className="text-left px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meals.slice(0, 6).map((m) => (
                      <tr
                        key={m.id ?? `${m.name}-${m.createdAt}`}
                        className="border-t border-white/10"
                      >
                        <td className="px-4 py-3">
                          {m.name || m.title || "Meal"}
                        </td>
                        <td className="px-4 py-3">
                          {m.calories ?? m.totalCalories ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {formatDate(m.createdAt || m.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Helpful note */}
        <div className="text-xs text-white/50">
          Backend: {API_BASE} • If meals don’t load, we’ll match this page to
          your real meal API route.
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-sm text-white/70">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}

function ActionCard({ title, desc, button, onClick }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
      <div>
        <div className="text-base font-semibold">{title}</div>
        <div className="mt-1 text-sm text-white/70">{desc}</div>
      </div>
      <button
        onClick={onClick}
        className="mt-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-semibold transition"
      >
        {button}
      </button>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "-";
  try {
    const date = new Date(d);
    return date.toLocaleString();
  } catch {
    return String(d);
  }
}

