"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/foods", label: "Foods", icon: "🍎" },
    { href: "/admin/meals", label: "Meals", icon: "🍽️" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/reports", label: "Reports", icon: "📈" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg fixed h-screen flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          {isOpen && (
            <div>
              <h2 className="text-2xl font-bold text-blue-400">Food Tracker</h2>
              <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
            </div>
          )}
          {!isOpen && <span className="text-2xl text-blue-400">🍽️</span>}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mx-4 mt-4 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors duration-200"
          title={isOpen ? "Collapse" : "Expand"}
        >
          <span className="text-xl">{isOpen ? "◀" : "▶"}</span>
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={!isOpen ? item.label : ""}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 space-y-4">
          {isOpen && (
            <div className="text-sm">
              <p className="text-slate-400 text-xs uppercase tracking-wide">Logged in as</p>
              <p className="text-white font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email || ""}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            title={!isOpen ? "Logout" : ""}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            {isOpen ? "Logout" : "🚪"}
          </button>
        </div>
      </aside>

      {/* Spacer to prevent content overlap */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`} />
    </>
  );
}
