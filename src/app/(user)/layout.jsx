"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserLayout({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (String(role || "").toUpperCase() === "ADMIN") {
      window.location.href = "/admin";
      return;
    }

    try {
      setUser(userData ? JSON.parse(userData) : null);
    } catch {
      setUser(null);
    }

    const savedTheme = localStorage.getItem("theme");
    setTheme(savedTheme === "light" ? "light" : "dark");

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme, ready]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-white">
            <div className="animate-spin">⏳</div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleTitleClick = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  const navLink = (href, label, icon) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition ${
        isActive(href)
          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 text-white">
      {/* Header/Navbar */}
      <header className="border-b border-white/10 bg-indigo-950/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🍽️</div>
            <Link
              href={pathname || "/"}
              onClick={handleTitleClick}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent"
            >
              Food Tracker
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-white/60">
              {user?.name || user?.email || "User"}
            </span>

            <button
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium transition duration-200"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/20 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 px-4 py-2 text-sm font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-indigo-900/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex gap-2 flex-wrap">
            {navLink("/dashboard", "Dashboard", "📊")}
            {navLink("/meals", "Meals", "🍽️")}
            {navLink("/foods", "Foods", "🥗")}
            {navLink("/profile", "Profile", "👤")}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-indigo-950/60 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-white/40">
          <p>Food Tracker App • © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
