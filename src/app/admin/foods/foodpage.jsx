"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE || (process.env.NODE_ENV === "development" ? "http://localhost:5001" : "");

export default function FoodPage() {
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [image, setImage] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchFoods();
  }, [token]);

  const fetchFoods = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/foods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError("Failed to load foods");
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  };

  const submitFood = async (e) => {
    e.preventDefault();
    setError("");

    const url = editId ? `${API_BASE}/api/admin/foods/${editId}` : `${API_BASE}/api/admin/foods`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          calories: Number(calories),
          image: image || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save food");
      const data = await res.json();

      if (editId) {
        setFoods((prev) => prev.map((f) => (f.id === editId ? data : f)));
      } else {
        setFoods((prev) => [data, ...prev]);
      }

      clearForm();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const clearForm = () => {
    setEditId(null);
    setName("");
    setCalories("");
    setImage("");
  };

  const onFoodImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image is too large. Max size is 3MB.");
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      setImage(dataUrl);
      setError("");
    } catch {
      setError("Could not read this image. Try JPG or PNG under 3MB.");
    } finally {
      e.target.value = "";
    }
  };

  const editFood = (food) => {
    setEditId(food.id);
    setName(food.name);
    setCalories(String(food.calories));
    setImage(food.image || "");
    setError("");
  };

  const deleteFood = async (id) => {
    if (!confirm("Delete this food item?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/foods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
        Loading foods...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Nutrition Data</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Food Catalog</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">{editId ? "Edit Food" : "Add Food"}</h3>
            <p className="mt-1 text-sm text-slate-300">Create items used across all meals.</p>

            {error ? (
              <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={submitFood} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-slate-300">Food Name</label>
                <input
                  className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/40"
                  placeholder="e.g. Apple"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-slate-300">
                  Calories (per 100g)
                </label>
                <input
                  className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/40"
                  type="number"
                  placeholder="e.g. 52"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-slate-300">Image</label>
                <input
                  className="w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-cyan-100 hover:file:bg-cyan-500/30"
                  type="file"
                  accept="image/*"
                  onChange={onFoodImageSelect}
                />

                {image ? (
                  <div className="mt-3">
                    <img
                      src={image}
                      alt="Food preview"
                      className="h-20 w-20 rounded-lg object-cover border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="mt-2 text-xs text-rose-300 hover:text-rose-200"
                    >
                      Remove image
                    </button>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {editId ? "Update Food" : "Add Food"}
              </button>

              {editId ? (
                <button
                  type="button"
                  onClick={clearForm}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  Cancel
                </button>
              ) : null}
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {foods.length === 0 ? (
              <div className="p-10 text-center text-slate-300">No foods available. Add your first food.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Image</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Name</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Calories</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {foods.map((food) => (
                      <tr key={food.id} className="hover:bg-white/5">
                        <td className="px-5 py-4">
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="h-12 w-12 rounded-lg object-cover border border-white/20"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg border border-dashed border-white/20 bg-slate-900/40" />
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-white">{food.name}</td>
                        <td className="px-5 py-4 text-sm text-slate-300">{food.calories} kcal</td>
                        <td className="px-5 py-4 text-sm">
                          <button
                            onClick={() => editFood(food)}
                            className="mr-3 rounded-md bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFood(food.id)}
                            className="rounded-md bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
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

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onabort = () => reject(new Error("Image read was canceled"));
    reader.readAsDataURL(file);
  });
}
