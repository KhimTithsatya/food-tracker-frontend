"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { DashboardIcon, FoodsIcon, InfoIcon, MealsIcon, ProfileIcon, SpinnerIcon } from "../../components/user/Icons";

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

    const savedTheme = localStorage.getItem("theme") === "light" ? "light" : "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

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
            <SpinnerIcon className="h-4 w-4 animate-spin" />
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

  const navLink = (href, label, Icon) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition ${
        isActive(href)
          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 text-white">
      {/* Header/Navbar */}
      <header className="border-b border-white/10 bg-indigo-950/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-main.png"
              alt="My Healthy Bowl logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
            />
            <Link
              href={pathname || "/"}
              onClick={handleTitleClick}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent"
            >
              My Healthy Bowl
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-white/60">
              {user?.name || user?.email || "User"}
            </span>

            <ThemeSwitch
              checked={theme === "light"}
              onToggle={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            />

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
            {navLink("/dashboard", "Dashboard", DashboardIcon)}
            {navLink("/meals", "Meals", MealsIcon)}
            {navLink("/foods", "Foods", FoodsIcon)}
            {navLink("/profile", "Profile", ProfileIcon)}
            {navLink("/about", "About Us", InfoIcon)}
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
          <p>My Healthy Bowl • © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

function ThemeSwitch({ checked, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="inline-flex items-center gap-2"
    >
      <span className="text-xs text-white/60">{checked ? "Light" : "Dark"}</span>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
          checked
            ? "border-amber-300/50 bg-amber-400/25"
            : "border-white/20 bg-white/10"
        }`}
      >
        <span
          className={`absolute left-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        >
          {checked ? <SunIcon /> : <MoonIcon />}
        </span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
