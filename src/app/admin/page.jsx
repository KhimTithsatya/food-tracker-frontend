"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    foods: 0,
    meals: 0,
  });
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      const [usersRes, foodsRes, mealsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/foods`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/meals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const parseJson = async (res, label) => {
        const text = await res.text();
        let data = null;

        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          throw new Error(`${label} returned non-JSON (status ${res.status}).`);
        }

        if (!res.ok) {
          throw new Error(
            `${label} request failed: ${
              data?.message || `status ${res.status}`
            }`
          );
        }

        return data;
      };

      const users = await parseJson(usersRes, "Users");
      const foods = await parseJson(foodsRes, "Foods");
      const meals = await parseJson(mealsRes, "Meals");

      setStats({
        users: Array.isArray(users) ? users.length : 0,
        foods: Array.isArray(foods) ? foods.length : 0,
        meals: Array.isArray(meals) ? meals.length : 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading dashboard...
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Users</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.users}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Foods</h3>
          <p className="text-4xl font-bold text-green-600">{stats.foods}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Meals</h3>
          <p className="text-4xl font-bold text-purple-600">{stats.meals}</p>
        </div>
      </div>
    </div>
  );
}
