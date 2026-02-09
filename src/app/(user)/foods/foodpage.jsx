"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function FoodPage() {
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchFoods();
  }, [token]);

  const fetchFoods = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/foods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load foods");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitFood = async (e) => {
    e.preventDefault();
    setError("");

    const url = editId
      ? `${API_BASE}/api/foods/${editId}`
      : `${API_BASE}/api/foods`;

    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, calories: Number(calories) }),
      });

      if (!res.ok) throw new Error("Failed to save food");

      const data = await res.json();

      if (editId) {
        setFoods(foods.map((f) => (f.id === editId ? data : f)));
        setEditId(null);
      } else {
        setFoods([...foods, data]);
      }

      setName("");
      setCalories("");
    } catch (err) {
      setError(err.message);
    }
  };

  const editFood = (food) => {
    setEditId(food.id);
    setName(food.name);
    setCalories(food.calories);
  };

  const deleteFood = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/foods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setFoods(foods.filter((f) => f.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading foods...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Foods</h1>
        <p className="text-gray-600 mt-2">Add and manage foods in your library</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editId ? "Edit Food" : "Add New Food"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={submitFood} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Apple, Chicken breast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories (per 100g)
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  placeholder="e.g. 52, 165"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {editId ? "Update Food" : "Add Food"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setName("");
                    setCalories("");
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {foods.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p className="text-lg">No foods yet. Add your first food!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Name
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
                    {foods.map((food) => (
                      <tr key={food.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">{food.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {food.calories} kcal
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => editFood(food)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFood(food.id)}
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
      </div>
    </div>
  );
}
