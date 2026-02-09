"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function AdminReportsPage() {
  const [stats, setStats] = useState(null);
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
        fetch(`${API_BASE}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/foods`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/meals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const users = await usersRes.json();
      const foods = await foodsRes.json();
      const meals = await mealsRes.json();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">System statistics and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.users || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">Total Foods</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.foods || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">Total Meals</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.meals || 0}</p>
        </div>
      </div>
    </div>
  );
}
