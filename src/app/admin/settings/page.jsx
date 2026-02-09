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
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure application settings</p>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✓ Settings saved successfully
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Name
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              value={settings.appName}
              onChange={(e) => handleChange("appName", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Meals Per Day
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              value={settings.maxMealsPerDay}
              onChange={(e) =>
                handleChange("maxMealsPerDay", parseInt(e.target.value))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Calorie Goal
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              value={settings.dailyCalorieGoal}
              onChange={(e) =>
                handleChange("dailyCalorieGoal", parseInt(e.target.value))
              }
            />
          </div>

          <div className="flex items-center">
            <input
              className="w-4 h-4"
              type="checkbox"
              id="enableReports"
              checked={settings.enableReports}
              onChange={(e) => handleChange("enableReports", e.target.checked)}
            />
            <label htmlFor="enableReports" className="ml-2 text-sm text-gray-700">
              Enable Reports
            </label>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
