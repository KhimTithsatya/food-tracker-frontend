"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function UserPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [mealName, setMealName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

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
        const res = await fetch(`${API_BASE}/api/users/meals`, {
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

  const getMealCalories = (meal) => {
    if (Number.isFinite(Number(meal?.calories))) return Number(meal.calories);
    if (Number.isFinite(Number(meal?.totalCalories))) return Number(meal.totalCalories);
    if (Array.isArray(meal?.items)) {
      return meal.items.reduce(
        (sum, item) => sum + (item?.food?.calories || 0) * (item?.quantity || 0),
        0
      );
    }
    return 0;
  };

  const totalCalories = meals.reduce((sum, m) => sum + getMealCalories(m), 0);

  const filteredAndSortedMeals = meals
    .filter((meal) => {
      const mealNameText = String(meal?.name || meal?.title || "").toLowerCase();
      return mealNameText.includes(searchTerm.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "date_asc") {
        return new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0);
      }
      if (sortBy === "calories_desc") {
        return getMealCalories(b) - getMealCalories(a);
      }
      if (sortBy === "calories_asc") {
        return getMealCalories(a) - getMealCalories(b);
      }
      if (sortBy === "name_asc") {
        return String(a.name || a.title || "").localeCompare(String(b.name || b.title || ""));
      }
      if (sortBy === "name_desc") {
        return String(b.name || b.title || "").localeCompare(String(a.name || a.title || ""));
      }
      return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
    });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const createMeal = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (!mealName.trim()) {
      setError("Meal name is required");
      return;
    }

    try {
      setSavingMeal(true);
      const res = await fetch(`${API_BASE}/api/users/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: mealName.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create meal");
      }

      const created = await res.json();
      setMeals((prev) => [created, ...prev]);
      setMealName("");
      setShowAddModal(false);
    } catch (e) {
      setError(e.message || "Failed to create meal");
    } finally {
      setSavingMeal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
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
            onClick={() => setShowAddModal(true)}
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

          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search meals by name..."
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="calories_desc">Calories: high to low</option>
              <option value="calories_asc">Calories: low to high</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
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
                  onClick={() => setShowAddModal(true)}
                  className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-semibold transition"
                >
                  + Add First Meal
                </button>
              </div>
            )}

            {!loading && !error && meals.length > 0 && filteredAndSortedMeals.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/70 text-center">
                No meals found for your search.
              </div>
            )}

            {!loading && !error && filteredAndSortedMeals.length > 0 && (
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
                    {filteredAndSortedMeals.map((m) => (
                      <tr
                        key={m.id ?? `${m.name}-${m.createdAt}`}
                        className="hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 font-medium">
                          {m.name || m.title || "Untitled Meal"}
                        </td>
                        <td className="px-4 py-3 text-indigo-400 font-semibold">
                          {getMealCalories(m)} kcal
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

        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Add Meal</h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-sm text-white/80 hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <form onSubmit={createMeal} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/70">Meal Name</label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="e.g. Chicken rice"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <p className="text-xs text-white/50">
                  Calories are calculated from foods in each meal.
                </p>

                <button
                  type="submit"
                  disabled={savingMeal}
                  className="w-full rounded-lg bg-indigo-500 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
                >
                  {savingMeal ? "Saving..." : "Create Meal"}
                </button>
              </form>
            </div>
          </div>
        )}
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
