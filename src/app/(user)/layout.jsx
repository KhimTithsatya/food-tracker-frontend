"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UserLayout({ children }) {
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

    if (role === "admin") {
      window.location.href = "/admin";
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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Food Tracker</h1>
          <div className="flex gap-4 items-center">
            <Link href="/user/dashboard" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Dashboard
            </Link>
            <Link href="/user/meals" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Meals
            </Link>
            <Link href="/user/foods" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Foods
            </Link>
            <Link href="/user/profile" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Profile
            </Link>
            <span className="text-sm text-gray-600 px-3">{user?.name || "User"}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}