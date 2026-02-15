"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function FoodPage() {
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const res = await fetch(`${API_BASE}/api/user/foods`, {
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
    setSuccess("");

    const url = editId
      ? `${API_BASE}/api/user/foods/${editId}`
      : `${API_BASE}/api/user/foods`;

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
        setSuccess("Food updated successfully!");
      } else {
        setFoods([...foods, data]);
        setSuccess("Food added successfully!");
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
    setError("");
    setSuccess("");
  };

  const deleteFood = async (id) => {
    if (!confirm("Delete this food?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/user/foods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setFoods(foods.filter((f) => f.id !== id));
      setSuccess("Food deleted successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-flex items-center gap-2">
          <div className="animate-spin">⏳</div>
          <span className="text-white/70">Loading foods...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">🥗 Foods Library</h1>
        <p className="text-white/60 mt-2">Manage your food database and calories information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4">
              {editId ? "✏️ Edit Food" : "➕ Add New Food"}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-200 text-sm font-medium">
                {success}
              </div>
            )}

            <form onSubmit={submitFood} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Food Name
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g. Apple, Chicken breast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Calories (per 100g)
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  type="number"
                  placeholder="e.g. 52, 165"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg font-medium transition duration-200"
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
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-medium border border-white/20 transition duration-200"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Foods List Section */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Foods ({foods.length})</h3>
            
            {foods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-3">🥗</div>
                <p className="text-white/70 font-medium mb-2">No foods yet</p>
                <p className="text-white/50 text-sm">Add your first food to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-white/60 font-medium">Calories</th>
                      <th className="text-right px-4 py-3 text-white/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {foods.map((food) => (
                      <tr key={food.id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-white font-medium">{food.name}</td>
                        <td className="px-4 py-3 text-indigo-400 font-semibold">
                          {food.calories} kcal/100g
                        </td>
                        <td className="px-4 py-3 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => editFood(food)}
                            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFood(food.id)}
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
      </div>
    </div>
  );
}
