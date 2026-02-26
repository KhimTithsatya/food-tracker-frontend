"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MealsIcon, SpinnerIcon, WarningIcon } from "../../../components/user/Icons";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";
const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"];

const emptyItemDraft = {
  foodId: "",
  quantity: 1
};

export default function MealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [mealType, setMealType] = useState("OTHER");
  const [plannedFor, setPlannedFor] = useState("");

  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [plannerMealId, setPlannerMealId] = useState(null);
  const [itemDraft, setItemDraft] = useState(emptyItemDraft);
  const [itemQtyDrafts, setItemQtyDrafts] = useState({});
  const [savingItem, setSavingItem] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      window.location.href = "/login";
      return;
    }
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [mealsData, foodsData] = await Promise.all([
          request("/api/users/meals", { token }),
          request("/api/users/foods", { token })
        ]);

        setMeals(Array.isArray(mealsData) ? mealsData : mealsData?.meals || []);
        setFoods(Array.isArray(foodsData) ? foodsData : []);
      } catch (err) {
        setError(err.message || "Failed to load meal planner data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowAddModal(true);
      router.replace("/meals");
    }
  }, [searchParams, router]);

  const totalCalories = useMemo(
    () => meals.reduce((sum, m) => sum + getMealCalories(m), 0),
    [meals]
  );
  const avgCalories = useMemo(
    () => (meals.length > 0 ? Math.round(totalCalories / meals.length) : 0),
    [meals.length, totalCalories]
  );

  const filteredAndSortedMeals = useMemo(() => {
    return meals
      .filter((meal) => {
        const mealNameText = String(meal?.name || "").toLowerCase();
        const matchesSearch = mealNameText.includes(searchTerm.trim().toLowerCase());
        const matchesType = filterType === "ALL" || meal?.mealType === filterType;
        const matchesDate =
          !filterDate || toInputDate(meal?.plannedFor || meal?.createdAt) === filterDate;
        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === "date_asc") {
          return getMealSortDate(a) - getMealSortDate(b);
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
        return getMealSortDate(b) - getMealSortDate(a);
      });
  }, [meals, searchTerm, sortBy, filterType, filterDate]);

  const plannerMeal = meals.find((meal) => meal.id === plannerMealId) || null;

  useEffect(() => {
    if (!plannerMeal) {
      setItemQtyDrafts({});
      return;
    }
    const nextDrafts = {};
    (plannerMeal.items || []).forEach((item) => {
      nextDrafts[item.id] = item.quantity;
    });
    setItemQtyDrafts(nextDrafts);
  }, [plannerMeal]);

  const openCreateModal = () => {
    setEditingMealId(null);
    setMealName("");
    setMealDescription("");
    setMealType("OTHER");
    setPlannedFor(toInputDate(new Date().toISOString()));
    setError("");
    setShowAddModal(true);
  };

  const openEditModal = (meal) => {
    setEditingMealId(meal.id);
    setMealName(meal.name || "");
    setMealDescription(meal.description || "");
    setMealType(meal?.mealType || "OTHER");
    setPlannedFor(toInputDate(meal?.plannedFor));
    setError("");
    setShowAddModal(true);
  };

  const openPlannerModal = (meal) => {
    setPlannerMealId(meal.id);
    setItemDraft(emptyItemDraft);
    setError("");
    setShowPlannerModal(true);
  };

  const closePlannerModal = () => {
    setShowPlannerModal(false);
    setPlannerMealId(null);
    setItemDraft(emptyItemDraft);
    setItemQtyDrafts({});
  };

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
      const path = isEditing ? `/api/users/meals/${editingMealId}` : "/api/users/meals";
      const method = isEditing ? "PUT" : "POST";

      const savedMeal = await request(path, {
        method,
        token,
        body: JSON.stringify({
          name: mealName.trim(),
          description: mealDescription.trim() || null,
          mealType,
          plannedFor: plannedFor || null
        })
      });

      setMeals((prev) => {
        if (isEditing) {
          return prev.map((meal) => (meal.id === editingMealId ? savedMeal : meal));
        }
        return [savedMeal, ...prev];
      });

      setEditingMealId(null);
      setMealName("");
      setMealDescription("");
      setMealType("OTHER");
      setPlannedFor("");
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || `Failed to ${editingMealId ? "update" : "create"} meal`);
    } finally {
      setSavingMeal(false);
    }
  };

  const deleteMeal = async (id) => {
    if (!confirm("Delete this meal and all its foods?")) return;

    try {
      await request(`/api/users/meals/${id}`, {
        method: "DELETE",
        token
      });
      setMeals((prev) => prev.filter((meal) => meal.id !== id));
      if (plannerMealId === id) {
        closePlannerModal();
      }
    } catch (err) {
      setError(err.message || "Failed to delete meal");
    }
  };

  const addFoodToMeal = async (e) => {
    e.preventDefault();

    if (!plannerMealId) return;
    if (!itemDraft.foodId) {
      setError("Select a food to add");
      return;
    }

    const quantity = Number(itemDraft.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a positive whole number");
      return;
    }

    try {
      setSavingItem(true);
      const updatedMeal = await request(`/api/users/meals/${plannerMealId}/items`, {
        method: "POST",
        token,
        body: JSON.stringify({ foodId: Number(itemDraft.foodId), quantity })
      });

      setMeals((prev) => prev.map((meal) => (meal.id === plannerMealId ? updatedMeal : meal)));
      setItemDraft(emptyItemDraft);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to add food to meal");
    } finally {
      setSavingItem(false);
    }
  };

  const updateMealItemQty = async (itemId, nextQuantity) => {
    if (!plannerMealId) return;

    const quantity = Number(nextQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a positive whole number");
      return;
    }

    try {
      setUpdatingItemId(itemId);
      const updatedMeal = await request(`/api/users/meals/${plannerMealId}/items/${itemId}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ quantity })
      });

      setMeals((prev) => prev.map((meal) => (meal.id === plannerMealId ? updatedMeal : meal)));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeMealItem = async (itemId) => {
    if (!plannerMealId) return;

    try {
      setUpdatingItemId(itemId);
      const updatedMeal = await request(`/api/users/meals/${plannerMealId}/items/${itemId}`, {
        method: "DELETE",
        token
      });

      setMeals((prev) => prev.map((meal) => (meal.id === plannerMealId ? updatedMeal : meal)));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to remove food from meal");
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-flex items-center gap-2">
          <SpinnerIcon className="h-4 w-4 animate-spin" />
          <span className="text-white/70">Loading meals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white inline-flex items-center gap-3">
            <MealsIcon className="h-9 w-9 text-indigo-300" />
            Meal Planner
          </h1>
          <p className="text-white/60 mt-2">Plan meals, add foods, and track calories per meal</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-sm font-semibold transition duration-200"
        >
          + Create Meal Plan
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
          <p className="text-red-200 font-medium inline-flex items-center gap-2">
            <WarningIcon className="h-4 w-4" />
            <span>{error}</span>
          </p>
        </div>
      )}

      {meals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-white/60 font-medium">Total Meal Plans</p>
            <p className="mt-2 text-3xl font-bold">
              <AnimatedNumber value={meals.length} />
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-white/60 font-medium">Tracked Calories</p>
            <p className="mt-2 text-3xl font-bold text-indigo-400">
              <AnimatedNumber value={totalCalories} />
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <p className="text-sm text-white/60 font-medium">Avg Calories / Meal</p>
            <p className="mt-2 text-3xl font-bold text-blue-400">
              <AnimatedNumber value={avgCalories} />
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MealsIcon className="h-10 w-10 mb-3 text-indigo-300" />
            <p className="text-white/70 font-medium mb-2">No meal plans yet</p>
            <p className="text-white/50 text-sm mb-4">Create a meal and add foods to start tracking</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-semibold transition"
            >
              + Create First Meal Plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search meal plans..."
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-indigo-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All meal types</option>
                {MEAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeLabel(type)}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-indigo-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Type</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Planned For</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Foods</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Calories</th>
                      <th className="text-right px-4 py-3 text-white/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAndSortedMeals.map((meal) => (
                      <tr key={meal.id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3">
                          <p className="font-medium">{meal.name || "Untitled Meal"}</p>
                          {meal.description ? (
                            <p className="mt-1 text-xs text-white/60">{meal.description}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-cyan-300 text-xs font-semibold">
                          {typeLabel(meal?.mealType)}
                        </td>
                        <td className="px-4 py-3 text-white/70 text-sm">
                          {formatDate(meal?.plannedFor)}
                        </td>
                        <td className="px-4 py-3 text-white/70">{meal.items?.length || 0}</td>
                        <td className="px-4 py-3 text-indigo-400 font-semibold">
                          {getMealCalories(meal)} kcal
                        </td>
                        <td className="px-4 py-3 text-right flex gap-3 justify-end">
                          <button
                            type="button"
                            onClick={() => openPlannerModal(meal)}
                            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition"
                          >
                            Plan Foods
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(meal)}
                            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
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
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-indigo-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingMealId ? "Edit Meal Plan" : "Create Meal Plan"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMealId(null);
                  setMealName("");
                  setMealDescription("");
                  setMealType("OTHER");
                  setPlannedFor("");
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
                  placeholder="e.g. Monday Breakfast"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">Description (Optional)</label>
                <textarea
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="Add notes about this meal plan..."
                  maxLength={1000}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/70">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-indigo-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MEAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {typeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/70">Planned Date</label>
                  <input
                    type="date"
                    value={plannedFor}
                    onChange={(e) => setPlannedFor(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <p className="text-xs text-white/50">
                Add foods and quantities after creating the meal plan.
              </p>

              <button
                type="submit"
                disabled={savingMeal}
                className="w-full rounded-lg bg-indigo-500 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                {savingMeal ? "Saving..." : editingMealId ? "Update Meal Plan" : "Create Meal Plan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPlannerModal && plannerMeal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closePlannerModal} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-indigo-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{plannerMeal.name}</h2>
                <p className="text-sm text-white/60 mt-1">
                  {typeLabel(plannerMeal?.mealType)} • {formatDate(plannerMeal?.plannedFor)} •{" "}
                  {plannerMeal.items?.length || 0} items • {getMealCalories(plannerMeal)} kcal
                </p>
              </div>
              <button
                type="button"
                onClick={closePlannerModal}
                className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form onSubmit={addFoodToMeal} className="grid gap-3 md:grid-cols-4">
              <select
                value={itemDraft.foodId}
                onChange={(e) => setItemDraft((prev) => ({ ...prev, foodId: e.target.value }))}
                className="md:col-span-2 w-full rounded-lg border border-white/20 bg-indigo-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select food</option>
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.calories} kcal)
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                step="1"
                value={itemDraft.quantity}
                onChange={(e) => setItemDraft((prev) => ({ ...prev, quantity: e.target.value }))}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Qty"
              />

              <button
                type="submit"
                disabled={savingItem || foods.length === 0}
                className="rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                {savingItem ? "Adding..." : "Add Food"}
              </button>
            </form>

            {foods.length === 0 && (
              <p className="mt-3 text-xs text-amber-300">
                No foods available yet. Add foods from the Foods page first.
              </p>
            )}

            <div className="mt-6 max-h-[360px] overflow-auto rounded-xl border border-white/10">
              {plannerMeal.items?.length ? (
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Food</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Calories</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Quantity</th>
                      <th className="text-right px-4 py-3 text-white/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {plannerMeal.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-white font-medium">{item.food?.name || "Unknown food"}</td>
                        <td className="px-4 py-3 text-indigo-400">
                          {(item.food?.calories || 0) * (item.quantity || 0)} kcal
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={itemQtyDrafts[item.id] ?? item.quantity}
                            onChange={(e) =>
                              setItemQtyDrafts((prev) => ({
                                ...prev,
                                [item.id]: e.target.value
                              }))
                            }
                            onBlur={(e) => {
                              const nextValue = Number(e.target.value);
                              if (nextValue !== item.quantity) {
                                updateMealItemQty(item.id, nextValue);
                              }
                            }}
                            className="w-20 rounded border border-white/20 bg-white/10 px-2 py-1 text-white"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={updatingItemId === item.id}
                            onClick={() => removeMealItem(item.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium transition disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-white/60 text-sm">No foods added to this meal yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnimatedNumber({ value, durationMs = 900 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const from = display;
    let frame = 0;
    const startedAt = performance.now();

    const tick = (now) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);
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

function getMealCalories(meal) {
  if (Number.isFinite(Number(meal?.calories))) return Number(meal.calories);
  if (Array.isArray(meal?.items)) {
    return meal.items.reduce(
      (sum, item) => sum + (item?.food?.calories || 0) * (item?.quantity || 0),
      0
    );
  }
  return 0;
}

function getMealSortDate(meal) {
  return new Date(meal?.plannedFor || meal?.createdAt || 0);
}

function toInputDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return date.toLocaleDateString();
}

function typeLabel(type) {
  const safeType = MEAL_TYPES.includes(type) ? type : "OTHER";
  return safeType.charAt(0) + safeType.slice(1).toLowerCase();
}

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body } : {})
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && data.message) ||
      (typeof data === "string" && data) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}
