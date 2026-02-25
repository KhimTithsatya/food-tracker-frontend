"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    appName: "Food Tracker",
    maxMealsPerDay: 5,
    dailyCalorieGoal: 2000,
    enableReports: true,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Configuration</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Settings</h2>
        <p className="mt-2 text-slate-300">Adjust admin-side preferences</p>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          ✓ Settings saved successfully
        </div>
      )}

      <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-300">
              Application Name
            </label>
            <input
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-4 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/40"
              type="text"
              value={settings.appName}
              onChange={(e) => handleChange("appName", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-300">
              Max Meals Per Day
            </label>
            <input
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-4 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/40"
              type="number"
              value={settings.maxMealsPerDay}
              onChange={(e) =>
                handleChange("maxMealsPerDay", parseInt(e.target.value))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-300">
              Daily Calorie Goal
            </label>
            <input
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-4 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/40"
              type="number"
              value={settings.dailyCalorieGoal}
              onChange={(e) =>
                handleChange("dailyCalorieGoal", parseInt(e.target.value))
              }
            />
          </div>

          <div className="flex items-center">
            <input
              className="h-4 w-4 accent-cyan-400"
              type="checkbox"
              id="enableReports"
              checked={settings.enableReports}
              onChange={(e) => handleChange("enableReports", e.target.checked)}
            />
            <label htmlFor="enableReports" className="ml-2 text-sm text-slate-200">
              Enable Reports
            </label>
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

