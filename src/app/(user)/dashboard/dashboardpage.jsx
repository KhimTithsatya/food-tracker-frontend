"use client";

import { useEffect, useState } from "react";
import { userDashboard, userMeals } from "../../../services/user.api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [calendarView, setCalendarView] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userDashboard(), userMeals()])
      .then(([dashboardData, mealsData]) => {
        setData(dashboardData);
        setMeals(Array.isArray(mealsData) ? mealsData : []);
      })
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

  const weekDays = getWeekDays(selectedDate);
  const selectedDateKey = toDateKey(selectedDate);
  const dailyMeals = meals.filter((meal) => toDateKey(meal?.plannedFor || meal?.createdAt) === selectedDateKey);
  const weekMealsByDay = weekDays.map((day) => {
    const key = toDateKey(day);
    const items = meals.filter((meal) => toDateKey(meal?.plannedFor || meal?.createdAt) === key);
    return { day, key, items };
  });

  const isDaily = calendarView === "daily";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your meal tracking overview.</p>
      </div>

      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">Total Meals</h3>
            <p className="text-3xl font-bold text-indigo-600">{data.totalMeals || 0}</p>
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Meal Calendar</h2>
          <div className="inline-flex rounded-md border border-gray-200 p-1 w-fit">
            <button
              type="button"
              onClick={() => setCalendarView("daily")}
              className={`px-4 py-2 text-sm font-medium rounded ${
                isDaily ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setCalendarView("weekly")}
              className={`px-4 py-2 text-sm font-medium rounded ${
                !isDaily ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectedDate((current) => shiftDate(current, isDaily ? -1 : -7))}
            className="px-3 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(startOfDay(new Date()))}
            className="px-3 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate((current) => shiftDate(current, isDaily ? 1 : 7))}
            className="px-3 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
          >
            Next
          </button>
          <p className="text-sm font-medium text-gray-600 ml-1">
            {isDaily ? formatDateLabel(selectedDate) : `Week of ${formatDateLabel(weekDays[0])}`}
          </p>
        </div>

        {isDaily ? (
          <div className="space-y-3">
            {dailyMeals.length === 0 ? (
              <p className="text-sm text-gray-500">No meals planned for this day.</p>
            ) : (
              dailyMeals.map((meal) => (
                <div key={meal.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900">{meal.name || "Untitled Meal"}</p>
                    <span className="text-sm text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                      {typeLabel(meal.mealType)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {meal.items?.length || 0} food item(s) • {getMealCalories(meal)} kcal
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekMealsByDay.map(({ day, key, items }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setCalendarView("daily");
                  setSelectedDate(day);
                }}
                className="text-left border border-gray-200 rounded-md p-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition"
              >
                <p className="text-xs uppercase text-gray-500">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
                <p className="text-sm font-semibold text-gray-900">{formatShortDate(day)}</p>
                <p className="text-xs text-gray-600 mt-2">{items.length} meal(s)</p>
                <p className="text-xs text-gray-600">{items.reduce((sum, meal) => sum + getMealCalories(meal), 0)} kcal</p>
              </button>
            ))}
          </div>
        )}
      </div>

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

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function shiftDate(value, offsetDays) {
  const date = startOfDay(value);
  date.setDate(date.getDate() + offsetDays);
  return date;
}

function toDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getWeekDays(value) {
  const selected = startOfDay(value);
  const start = shiftDate(selected, -selected.getDay());
  return Array.from({ length: 7 }).map((_, index) => shiftDate(start, index));
}

function getMealCalories(meal) {
  if (Number.isFinite(Number(meal?.calories))) return Number(meal.calories);
  if (Array.isArray(meal?.items)) {
    return meal.items.reduce((sum, item) => {
      const foodCalories = Number(item?.food?.calories) || 0;
      const qty = Number(item?.quantity) || 0;
      return sum + foodCalories * qty;
    }, 0);
  }
  return 0;
}

function typeLabel(value) {
  const text = String(value || "OTHER").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDateLabel(value) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatShortDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
