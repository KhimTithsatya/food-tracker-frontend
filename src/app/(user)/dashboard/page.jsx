"use client";

import { useEffect, useState } from "react";
import { api } from "../../../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  api("/user/dashboard")
    .then(setData)
    .catch(() => (window.location.href = "/login"))
    .finally(() => setLoading(false));
}, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your meal tracking overview.</p>
      </div>

      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">Total Meals</h3>
            <p className="text-3xl font-bold text-blue-600">{data.totalMeals || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">Avg Calories</h3>
            <p className="text-3xl font-bold text-green-600">{data.avgCalories || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">Foods Tracked</h3>
            <p className="text-3xl font-bold text-purple-600">{data.totalFoods || 0}</p>
          </div>
        </div>
      ) : null}

      {data && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto text-gray-700">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

