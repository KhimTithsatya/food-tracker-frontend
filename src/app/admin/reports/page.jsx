"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function AdminReportsPage() {
  const [stats, setStats] = useState({ users: 0, foods: 0, meals: 0 });
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchReportData();
  }, [token]);

  const fetchReportData = async () => {
    try {
      setError("");
      const [usersRes, foodsRes, mealsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/foods`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/meals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const users = await usersRes.json().catch(() => []);
      const foods = await foodsRes.json().catch(() => []);
      const mealsData = await mealsRes.json().catch(() => []);

      if (!usersRes.ok || !foodsRes.ok || !mealsRes.ok) {
        throw new Error("Failed to load report data");
      }

      setStats({
        users: Array.isArray(users) ? users.length : 0,
        foods: Array.isArray(foods) ? foods.length : 0,
        meals: Array.isArray(mealsData) ? mealsData.length : 0,
      });
      setMeals(Array.isArray(mealsData) ? mealsData : []);
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const userOptions = useMemo(() => {
    const usersMap = new Map();
    meals.forEach((meal) => {
      if (meal.user?.id) {
        usersMap.set(String(meal.user.id), {
          id: String(meal.user.id),
          label: `${meal.user.name || "Unknown"} (${meal.user.email || "-"})`,
        });
      }
    });
    return Array.from(usersMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [meals]);

  const reportRows = useMemo(() => {
    const text = query.trim().toLowerCase();
    return meals.filter((meal) => {
      if (mealTypeFilter !== "ALL" && String(meal.mealType || "OTHER") !== mealTypeFilter) {
        return false;
      }
      if (userFilter !== "ALL" && String(meal.user?.id || "") !== userFilter) {
        return false;
      }
      if (!text) return true;

      const haystack = [
        meal.name,
        meal.mealType,
        meal.user?.name,
        meal.user?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(text);
    });
  }, [meals, query, mealTypeFilter, userFilter]);

  const exportCsv = () => {
    if (!reportRows.length) return;

    const headers = [
      "Meal ID",
      "Meal Name",
      "Meal Type",
      "User Name",
      "User Email",
      "Planned For",
      "Created At",
    ];

    const body = reportRows.map((meal) => [
      meal.id,
      meal.name || "",
      meal.mealType || "",
      meal.user?.name || "",
      meal.user?.email || "",
      formatDate(meal.plannedFor),
      formatDate(meal.createdAt),
    ]);

    const csv = [headers, ...body]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Insights</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Reports</h2>
        <p className="mt-2 text-slate-300">View report rows and export for Excel.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/15 to-cyan-400/5 p-6">
          <h3 className="text-sm uppercase tracking-wider text-cyan-200/80">Total Users</h3>
          <p className="mt-3 text-3xl font-semibold text-white">
            <AnimatedNumber value={stats.users} />
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/15 to-emerald-400/5 p-6">
          <h3 className="text-sm uppercase tracking-wider text-emerald-200/80">Total Foods</h3>
          <p className="mt-3 text-3xl font-semibold text-white">
            <AnimatedNumber value={stats.foods} />
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-300/20 bg-gradient-to-br from-indigo-400/15 to-indigo-400/5 p-6">
          <h3 className="text-sm uppercase tracking-wider text-indigo-200/80">Total Meals</h3>
          <p className="mt-3 text-3xl font-semibold text-white">
            <AnimatedNumber value={stats.meals} />
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by meal, user, email, type..."
              className="w-full md:max-w-md rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/40"
            />
            <select
              value={mealTypeFilter}
              onChange={(e) => setMealTypeFilter(e.target.value)}
              className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="ALL">All Types</option>
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack</option>
              <option value="OTHER">Other</option>
            </select>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="ALL">All Users</option>
              {userOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!reportRows.length}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export to Excel (CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Meal</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Type</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-300">User</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Email</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Planned For</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {reportRows.length ? (
                reportRows.map((meal) => (
                  <tr key={meal.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm text-white">{meal.name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{meal.mealType || "OTHER"}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{meal.user?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{meal.user?.email || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{formatDate(meal.plannedFor)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{formatDate(meal.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No report rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function AnimatedNumber({ value, durationMs = 900 }) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const from = displayRef.current;
    let frame = 0;
    const startedAt = performance.now();

    const tick = (now) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <>{display.toLocaleString()}</>;
}
