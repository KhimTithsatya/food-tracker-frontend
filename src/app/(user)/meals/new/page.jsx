"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE || (process.env.NODE_ENV === "development" ? "http://localhost:5001" : "");

export default function NewMealPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!name.trim()) {
      setError("Meal name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create meal");
      }

      router.push("/meals");
    } catch (err) {
      setError(err.message || "Could not create meal");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Add New Meal</h1>
          <p className="text-white/60 mt-1">Create a meal and add foods to track calories.</p>
        </div>
        <Link
          href="/meals"
          className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium transition"
        >
          Back to Meals
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Meal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Breakfast, Chicken Salad"
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short note about the meal"
              rows={3}
              maxLength={1000}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <p className="text-xs text-white/50">
            Calories are calculated from foods in the meal.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white py-2.5 font-semibold transition"
          >
            {saving ? "Saving..." : "Create Meal"}
          </button>
        </form>
      </div>
    </div>
  );
}
