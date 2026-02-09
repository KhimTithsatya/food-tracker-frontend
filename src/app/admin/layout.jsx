"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (role !== "ADMIN") {
      window.location.href = "/user/dashboard";
      return;
    }

    try {
      setUser(JSON.parse(userData || "{}"));
    } catch {
      setUser(null);
    }

    setReady(true);
  }, []);

  if (!ready) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-8">Food Tracker</h2>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/foods"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
            >
              Foods
            </Link>
            <Link
              href="/admin/meals"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
            >
              Meals
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
            >
              Users
            </Link>
            <Link
              href="/admin/reports"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
            >
              Reports
            </Link>
            <Link
              href="/admin/settings"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
          <p className="text-sm text-gray-600 mb-4">Admin: {user?.name || "User"}</p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1">
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
