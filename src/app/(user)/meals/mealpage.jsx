"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function MealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);
  const [mealName, setMealName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchMeals();
  }, [token]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowAddModal(true);
      router.replace("/meals");
    }
  }, [searchParams, router]);

  const fetchMeals = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/meals`, {
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
      const res = await fetch(`${API_BASE}/api/users/meals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setMeals(meals.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const getMealCalories = (meal) => {
    if (Number.isFinite(Number(meal?.calories))) return Number(meal.calories);
    if (Array.isArray(meal?.items)) {
      return meal.items.reduce(
        (sum, item) => sum + (item?.food?.calories || 0) * (item?.quantity || 0),
        0
      );
    }
    return 0;
  };

  const filteredAndSortedMeals = meals
    .filter((meal) => {
      const mealNameText = String(meal?.name || "").toLowerCase();
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
        return String(a.name || "").localeCompare(String(b.name || ""));
      }
      if (sortBy === "name_desc") {
        return String(b.name || "").localeCompare(String(a.name || ""));
      }
      return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
    });

  const saveMeal = async (e) => {
    e.preventDefault();
    setError("");

    if (!mealName.trim()) {
      setError("Meal name is required");
      return;
    }

    try {
      setSavingMeal(true);
      const isEditing = Boolean(editingMealId);
      const url = isEditing
        ? `${API_BASE}/api/users/meals/${editingMealId}`
        : `${API_BASE}/api/users/meals`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: mealName.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to ${isEditing ? "update" : "create"} meal`);
      }

      const savedMeal = await res.json();
      if (isEditing) {
        setMeals((prev) =>
          prev.map((meal) => (meal.id === editingMealId ? savedMeal : meal))
        );
      } else {
        setMeals((prev) => [savedMeal, ...prev]);
      }

      setEditingMealId(null);
      setMealName("");
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || `Failed to ${editingMealId ? "update" : "create"} meal`);
    } finally {
      setSavingMeal(false);
    }
  };

  const openCreateModal = () => {
    setEditingMealId(null);
    setMealName("");
    setError("");
    setShowAddModal(true);
  };

  const openEditModal = (meal) => {
    setEditingMealId(meal.id);
    setMealName(meal.name || "");
    setError("");
    setShowAddModal(true);
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

  const totalCalories = meals.reduce((sum, m) => sum + getMealCalories(m), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">🍽️ Meals</h1>
          <p className="text-white/60 mt-2">Track your daily meals and calories</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-sm font-semibold transition duration-200"
        >
          + Add Meal
        </button>
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
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-semibold transition"
            >
              + Add First Meal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
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

            {filteredAndSortedMeals.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/70 text-center">
                No meals found for your search.
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
                    {filteredAndSortedMeals.map((meal) => (
                      <tr key={meal.id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3 font-medium">{meal.name || "Untitled Meal"}</td>
                        <td className="px-4 py-3 text-indigo-400 font-semibold">
                          {getMealCalories(meal)} kcal
                        </td>
                        <td className="px-4 py-3 text-white/60 text-sm">
                          {meal.createdAt ? new Date(meal.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-right flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => openEditModal(meal)}
                            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition"
                          >
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
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingMealId ? "Edit Meal" : "Add Meal"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMealId(null);
                  setMealName("");
                }}
                className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-sm text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form onSubmit={saveMeal} className="space-y-4">
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
                Calories are calculated from foods added to each meal.
              </p>

              <button
                type="submit"
                disabled={savingMeal}
                className="w-full rounded-lg bg-indigo-500 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                {savingMeal
                  ? "Saving..."
                  : editingMealId
                    ? "Update Meal"
                    : "Create Meal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
