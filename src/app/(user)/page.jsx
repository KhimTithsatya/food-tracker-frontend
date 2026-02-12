"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function UserPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setToken(storedToken || "");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError("");

       try {
        const res = await fetch(`${API_BASE}/api/user/meals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load meals");
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.meals || [];
        setMeals(list);
      } catch (e) {
        setError(
          "Could not load your meals. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const totalCalories = useMemo(() => {
    return meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  }, [meals]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-white/60 mt-1">
              {user?.email ? `Welcome, ${user.email}` : "Welcome back!"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 px-4 py-2 text-sm font-medium transition duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Meals"
            value={loading ? "..." : String(meals.length)}
            sub="meals logged"
            icon="🍽️"
          />
          <StatCard
            title="Total Calories"
            value={loading ? "..." : String(totalCalories)}
            sub="from all meals"
            icon="🔥"
          />
          <StatCard
            title="Account Status"
            value={String(user?.role || "USER")}
            sub="user role"
            icon="👤"
          />
        </section>

        {/* Quick Actions */}
        <section className="grid gap-4 md:grid-cols-3">
          <ActionCard
            title="Log a Meal"
            desc="Add a new meal to your tracker"
            icon="➕"
            onClick={() => (window.location.href = "/meals/new")}
            button="Add Meal"
          />
          <ActionCard
            title="View Foods"
            desc="Browse and manage your food items"
            icon="🥗"
            onClick={() => (window.location.href = "/foods")}
            button="View Foods"
          />
          <ActionCard
            title="Profile Settings"
            desc="Update your account and preferences"
            icon="⚙️"
            onClick={() => (window.location.href = "/profile")}
            button="Settings"
          />
        </section>

        {/* Recent Meals Section */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>📊</span> Recent Meals
              </h2>
              <p className="text-sm text-white/50 mt-1">Your latest meal entries</p>
            </div>
            {meals.length > 0 && (
              <Link
                href="/meals"
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 transition"
              >
                View all →
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin">⏳</div>
                  <span className="text-white/70">Loading your meals...</span>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm">
                <p className="text-red-200 font-medium">⚠️ {error}</p>
                <p className="text-white/60 text-xs mt-2">
                  Please check your connection or contact support.
                </p>
              </div>
            )}

            {!loading && !error && meals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-3">🍽️</div>
                <p className="text-white/70 font-medium mb-2">No meals logged yet</p>
                <p className="text-white/50 text-sm mb-4">
                  Start tracking by adding your first meal
                </p>
                <button
                  onClick={() => (window.location.href = "/meals/new")}
                  className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-semibold transition"
                >
                  + Add First Meal
                </button>
              </div>
            )}

            {!loading && !error && meals.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-white/60 font-medium">
                        Meal Name
                      </th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">
                        Calories
                      </th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">
                        Date
                      </th>
                      <th className="text-right px-4 py-3 text-white/60 font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {meals.slice(0, 5).map((m) => (
                      <tr
                        key={m.id ?? `${m.name}-${m.createdAt}`}
                        className="hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 font-medium">
                          {m.name || m.title || "Untitled Meal"}
                        </td>
                        <td className="px-4 py-3 text-indigo-400 font-semibold">
                          {m.calories ?? m.totalCalories ?? "-"} kcal
                        </td>
                        <td className="px-4 py-3 text-white/60 text-sm">
                          {formatDate(m.createdAt || m.date)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition">
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Footer Info */}
        <div className="text-xs text-white/40 text-center py-4 border-t border-white/5">
          <p>Food Tracker • {new Date().getFullYear()}</p>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, sub, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60 font-medium">{title}</p>
          <p className="mt-3 text-4xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-white/50">{sub}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, button, onClick, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-indigo-500/30 hover:bg-indigo-500/5 transition">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-white/70">{desc}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-semibold transition duration-200"
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}

