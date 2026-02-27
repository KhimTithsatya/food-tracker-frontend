"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE || (process.env.NODE_ENV === "development" ? "http://localhost:5001" : "");

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    foods: 0,
    meals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchStats();
  }, [token]);

  const fetchStats = async () => {
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

      const parseJson = async (res, label) => {
        const text = await res.text();
        let data = null;

        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          throw new Error(`${label} returned non-JSON (status ${res.status}).`);
        }

        if (!res.ok) {
          throw new Error(
            `${label} request failed: ${
              data?.message || `status ${res.status}`
            }`
          );
        }

        return data;
      };

      const users = await parseJson(usersRes, "Users");
      const foods = await parseJson(foodsRes, "Foods");
      const meals = await parseJson(mealsRes, "Meals");

      setStats({
        users: Array.isArray(users) ? users.length : 0,
        foods: Array.isArray(foods) ? foods.length : 0,
        meals: Array.isArray(meals) ? meals.length : 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setError(error.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-10 text-slate-300">
        Loading dashboard...
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Overview</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Dashboard</h2>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/15 to-cyan-400/5 p-6">
          <p className="text-sm uppercase tracking-wider text-cyan-200/80">Users</p>
          <p className="mt-3 text-4xl font-semibold text-white">
            <AnimatedNumber value={stats.users} />
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/15 to-emerald-400/5 p-6">
          <p className="text-sm uppercase tracking-wider text-emerald-200/80">Foods</p>
          <p className="mt-3 text-4xl font-semibold text-white">
            <AnimatedNumber value={stats.foods} />
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-300/20 bg-gradient-to-br from-indigo-400/15 to-indigo-400/5 p-6">
          <p className="text-sm uppercase tracking-wider text-indigo-200/80">Meals</p>
          <p className="mt-3 text-4xl font-semibold text-white">
            <AnimatedNumber value={stats.meals} />
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <p className="mt-1 text-sm text-slate-300">
          Manage users, curate food data, and monitor activity from the admin menu.
        </p>
      </div>
    </div>
  );
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
