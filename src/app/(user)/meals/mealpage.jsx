"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function MealPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchMeals();
  }, [token]);

  const fetchMeals = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/meals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : data.meals || []);
    } catch (err) {
      setError("Failed to load meals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (id) => {
    if (!confirm("Delete this meal?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/user/meals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setMeals(meals.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-flex items-center gap-2">
          <div className="animate-spin">⏳</div>
          <span className="text-white/70">Loading meals...</span>
        </div>
      </div>
    );
  }

  const totalCalories = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">🍽️ Meals</h1>
          <p className="text-white/60 mt-2">Track your daily meals and calories</p>
        </div>
        <Link
          href="/meals/new"
          className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-sm font-semibold transition duration-200"
        >
          + Add Meal
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
          <p className="text-red-200 font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Stats Overview */}
      {meals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-white/60 font-medium">Total Meals</p>
            <p className="mt-2 text-3xl font-bold">{meals.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-white/60 font-medium">Total Calories</p>
            <p className="mt-2 text-3xl font-bold text-indigo-400">{totalCalories}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-white/60 font-medium">Avg per Meal</p>
            <p className="mt-2 text-3xl font-bold text-blue-400">{Math.round(totalCalories / meals.length)}</p>
          </div>
        </div>
      )}

      {/* Meals List */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-white/70 font-medium mb-2">No meals logged yet</p>
            <p className="text-white/50 text-sm mb-4">Start tracking by adding your first meal</p>
            <Link
              href="/meals/new"
              className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-semibold transition"
            >
              + Add First Meal
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-white/60 font-medium">Meal Name</th>
                  <th className="text-left px-4 py-3 text-white/60 font-medium">Calories</th>
                  <th className="text-left px-4 py-3 text-white/60 font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-white/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {meals.map((meal) => (
                  <tr key={meal.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-medium">{meal.name || "Untitled Meal"}</td>
                    <td className="px-4 py-3 text-indigo-400 font-semibold">
                      {meal.calories || 0} kcal
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {meal.createdAt ? new Date(meal.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right flex gap-2 justify-end">
                      <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition">
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMeal(meal.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
