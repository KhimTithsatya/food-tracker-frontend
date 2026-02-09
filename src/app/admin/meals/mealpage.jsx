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
        <h1 className="text-3xl font-bold text-gray-900">Meals</h1>
        <p className="text-gray-600 mt-2">All tracked meals across the platform</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {meals.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <p className="text-lg">No meals tracked yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Meal Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Calories
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {meals.map((meal) => (
                  <tr key={meal.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {meal.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(meal.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {meal.calories || 0} kcal
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => deleteMeal(meal.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
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