"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/foods", label: "Foods" },
  { href: "/admin/meals", label: "Meals" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }) {
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

    if (String(role || "").toUpperCase() !== "ADMIN") {
      window.location.href = "/dashboard";
      return;
    }

    try {
      setUser(JSON.parse(userData || "{}"));
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
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        Loading admin panel...
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <aside className="hidden md:flex md:fixed md:inset-y-0 md:w-72 md:flex-col border-r border-white/10 bg-slate-900/70 backdrop-blur-xl">
        <div className="p-6 border-b border-white/10">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Control Center</p>
          <div className="mt-3 flex items-center gap-3">
            <Image
              src="/logo-main.png"
              alt="My Healthy Bowl logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg object-contain"
            />
            <h2 className="text-2xl font-semibold text-white">My Healthy Bowl</h2>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-cyan-400/20 text-cyan-100 border border-cyan-300/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="text-sm font-semibold text-white truncate">{user?.name || "Admin"}</p>
          <div className="mt-3">
            <ThemeSwitch
              checked={theme === "light"}
              onToggle={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            />
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="md:pl-72">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Panel</p>
            <h1 className="text-xl md:text-2xl font-semibold text-white">Platform Management</h1>
            <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                      active ? "bg-cyan-400/20 text-cyan-200" : "bg-white/5 text-slate-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <ThemeSwitch
                checked={theme === "light"}
                onToggle={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
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
      <span className="text-xs text-slate-300">{checked ? "Light" : "Dark"}</span>
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
