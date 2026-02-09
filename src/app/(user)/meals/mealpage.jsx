"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

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
      const res = await fetch(`${API_BASE}/api/meals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : []);
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
      const res = await fetch(`${API_BASE}/api/meals/${id}`, {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading meals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Meals</h1>
        <p className="text-gray-600 mt-2">Track your daily meals and calories</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            <p className="text-lg">No meals tracked yet. Start logging your meals!</p>
          </div>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{meal.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(meal.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteMeal(meal.id)}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories:</span>
                  <span className="font-semibold text-gray-900">
                    {meal.calories || 0} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein:</span>
                  <span className="font-semibold text-gray-900">
                    {meal.protein || 0}g
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
