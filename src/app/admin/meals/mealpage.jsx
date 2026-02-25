"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function MealPage() {
  const [meals, setMeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editMealId, setEditMealId] = useState(null);
  const [newMeal, setNewMeal] = useState({
    userId: "",
    name: "",
    mealType: "OTHER",
    plannedFor: ""
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchMealsAndUsers();
  }, [token]);

  const fetchMealsAndUsers = async () => {
    try {
      const [mealsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/meals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      const mealsData = await mealsRes.json().catch(() => []);
      const usersData = await usersRes.json().catch(() => []);
      if (!mealsRes.ok) throw new Error("Failed to load meals");
      if (!usersRes.ok) throw new Error("Failed to load users");
      setMeals(Array.isArray(mealsData) ? mealsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load meals");
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  };

  const createMeal = async (e) => {
    e.preventDefault();
    setError("");

    if (!newMeal.userId || !newMeal.name) {
      setError("Please choose user and meal name");
      return;
    }

    setCreating(true);
    try {
      const isEdit = Boolean(editMealId);
      const res = await fetch(
        isEdit ? `${API_BASE}/api/admin/meals/${editMealId}` : `${API_BASE}/api/admin/meals`,
        {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMeal)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Failed to ${isEdit ? "update" : "create"} meal`);
      if (isEdit) {
        setMeals((prev) => prev.map((m) => (m.id === editMealId ? data : m)));
      } else {
        setMeals((prev) => [data, ...prev]);
      }
      setNewMeal({ userId: "", name: "", mealType: "OTHER", plannedFor: "" });
      setEditMealId(null);
    } catch (createError) {
      setError(createError.message || "Failed to create meal");
    } finally {
      setCreating(false);
    }
  };

  const beginEditMeal = (meal) => {
    setEditMealId(meal.id);
    setNewMeal({
      userId: String(meal.userId || meal.user?.id || ""),
      name: meal.name || "",
      mealType: meal.mealType || "OTHER",
      plannedFor: meal.plannedFor ? new Date(meal.plannedFor).toISOString().slice(0, 10) : ""
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditMealId(null);
    setNewMeal({ userId: "", name: "", mealType: "OTHER", plannedFor: "" });
  };

  const deleteMeal = async (id) => {
    if (!confirm("Delete this meal?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/meals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setMeals((prev) => prev.filter((meal) => meal.id !== id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
        Loading meals...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Activity</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Meals</h2>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={createMeal} className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">{editMealId ? "Edit Meal" : "Add Meal"}</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <select
            value={newMeal.userId}
            onChange={(e) => setNewMeal((p) => ({ ...p, userId: e.target.value }))}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <input
            value={newMeal.name}
            onChange={(e) => setNewMeal((p) => ({ ...p, name: e.target.value }))}
            placeholder="Meal name"
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          />
          <select
            value={newMeal.mealType}
            onChange={(e) => setNewMeal((p) => ({ ...p, mealType: e.target.value }))}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="BREAKFAST">BREAKFAST</option>
            <option value="LUNCH">LUNCH</option>
            <option value="DINNER">DINNER</option>
            <option value="SNACK">SNACK</option>
            <option value="OTHER">OTHER</option>
          </select>
          <input
            type="date"
            value={newMeal.plannedFor}
            onChange={(e) => setNewMeal((p) => ({ ...p, plannedFor: e.target.value }))}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {creating ? (editMealId ? "Saving..." : "Adding...") : (editMealId ? "Save Meal" : "Add Meal")}
          </button>
        </div>
        {editMealId ? (
          <button
            type="button"
            onClick={cancelEdit}
            className="mt-3 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Cancel Edit
          </button>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {meals.length === 0 ? (
          <div className="p-10 text-center text-slate-300">No meals tracked yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Meal</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">User</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Date</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Type</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {meals.map((meal) => {
                  const dateValue = meal.plannedFor || meal.createdAt;
                  return (
                    <tr key={meal.id} className="hover:bg-white/5">
                      <td className="px-5 py-4 text-sm font-medium text-white">{meal.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {meal.user?.name || "Unknown"}{" "}
                        <span className="text-slate-500">({meal.user?.email || "-"})</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {dateValue ? new Date(dateValue).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{meal.mealType || "OTHER"}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => beginEditMeal(meal)}
                          className="mr-2 rounded-md bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="rounded-md bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
