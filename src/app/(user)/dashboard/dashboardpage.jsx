"use client";

import { useEffect, useState } from "react";
import { userDashboard, userMeals } from "../../../services/user.api";

const DASHBOARD_STATS_CACHE_KEY = "dashboard_stats_cache_v1";

export default function Dashboard() {
  const [stats, setStats] = useState(() => readCachedStats());
  const [meals, setMeals] = useState([]);
  const [calendarView, setCalendarView] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.allSettled([userDashboard(), userMeals()])
      .then(([dashboardResult, mealsResult]) => {
        if (!active) return;

        const mealsData =
          mealsResult.status === "fulfilled" && Array.isArray(mealsResult.value) ? mealsResult.value : [];
        setMeals(mealsData);

        const hasAnySuccess = dashboardResult.status === "fulfilled" || mealsResult.status === "fulfilled";
        if (!hasAnySuccess) {
          window.location.href = "/login";
          return;
        }

        if (dashboardResult.status === "fulfilled" && dashboardResult.value) {
          const normalized = normalizeStats(dashboardResult.value);
          setStats(normalized);
          writeCachedStats(normalized);
          return;
        }

        const fallbackStats = buildStatsFromMeals(mealsData);
        setStats(fallbackStats);
        writeCachedStats(fallbackStats);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Welcome back! Here's your meal tracking overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="text-sm font-medium text-white/60 mb-2">Total Meals</h3>
          <p className="text-3xl font-bold text-white">
            <AnimatedNumber value={stats.totalMeals} />
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="text-sm font-medium text-white/60 mb-2">Avg Calories</h3>
          <p className="text-3xl font-bold text-indigo-400">
            <AnimatedNumber value={stats.avgCalories} />
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="text-sm font-medium text-white/60 mb-2">Foods Tracked</h3>
          <p className="text-3xl font-bold text-blue-400">
            <AnimatedNumber value={stats.totalFoods} />
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-white">Meal Calendar</h2>
          <div className="inline-flex rounded-md border border-white/15 bg-black/20 p-1 w-fit">
            <button
              type="button"
              onClick={() => setCalendarView("daily")}
              className={`px-4 py-2 text-sm font-medium rounded ${
                isDaily ? "bg-indigo-500 text-white" : "text-white/70 hover:bg-white/10"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setCalendarView("weekly")}
              className={`px-4 py-2 text-sm font-medium rounded ${
                !isDaily ? "bg-indigo-500 text-white" : "text-white/70 hover:bg-white/10"
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
            className="px-3 py-2 rounded border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 text-sm"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(startOfDay(new Date()))}
            className="px-3 py-2 rounded border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 text-sm"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate((current) => shiftDate(current, isDaily ? 1 : 7))}
            className="px-3 py-2 rounded border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 text-sm"
          >
            Next
          </button>
          <p className="text-sm font-medium text-white/70 ml-1">
            {isDaily ? formatDateLabel(selectedDate) : `Week of ${formatDateLabel(weekDays[0])}`}
          </p>
        </div>

        {isDaily ? (
          <div className="space-y-3">
            {dailyMeals.length === 0 ? (
              <p className="text-sm text-white/60">No meals planned for this day.</p>
            ) : (
              dailyMeals.map((meal) => (
                <div key={meal.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">{meal.name || "Untitled Meal"}</p>
                    <span className="text-sm text-indigo-200 bg-indigo-400/20 px-2 py-1 rounded">
                      {typeLabel(meal.mealType)}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 mt-2">
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
                className="text-left rounded-xl border border-white/10 bg-black/20 p-3 hover:border-indigo-300/50 hover:bg-indigo-500/10 transition"
              >
                <p className="text-xs uppercase text-white/50">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
                <p className="text-sm font-semibold text-white">{formatShortDate(day)}</p>
                <p className="text-xs text-white/70 mt-2">{items.length} meal(s)</p>
                <p className="text-xs text-white/70">{items.reduce((sum, meal) => sum + getMealCalories(meal), 0)} kcal</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <h2 className="text-xl font-bold text-white mb-4">Details</h2>
        <pre className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm overflow-auto text-white/70">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function readCachedStats() {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = localStorage.getItem(DASHBOARD_STATS_CACHE_KEY);
    if (!raw) return emptyStats();
    return normalizeStats(JSON.parse(raw));
  } catch {
    return emptyStats();
  }
}

function writeCachedStats(value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DASHBOARD_STATS_CACHE_KEY, JSON.stringify(normalizeStats(value)));
}

function normalizeStats(value) {
  return {
    totalMeals: Number(value?.totalMeals) || 0,
    avgCalories: Number(value?.avgCalories) || 0,
    totalFoods: Number(value?.totalFoods) || 0,
    totalCalories: Number(value?.totalCalories) || 0
  };
}

function emptyStats() {
  return {
    totalMeals: 0,
    avgCalories: 0,
    totalFoods: 0,
    totalCalories: 0
  };
}

function buildStatsFromMeals(meals) {
  const list = Array.isArray(meals) ? meals : [];
  const totalMeals = list.length;
  const totalCalories = list.reduce((sum, meal) => sum + getMealCalories(meal), 0);
  const avgCalories = totalMeals ? Math.round(totalCalories / totalMeals) : 0;
  const uniqueFoods = new Set();

  list.forEach((meal) => {
    if (!Array.isArray(meal?.items)) return;
    meal.items.forEach((item) => {
      if (item?.food?.id != null) uniqueFoods.add(String(item.food.id));
    });
  });

  return {
    totalMeals,
    avgCalories,
    totalFoods: uniqueFoods.size,
    totalCalories
  };
}

function AnimatedNumber({ value, durationMs = 900 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let frame = 0;
    const startedAt = performance.now();
    const from = display;

    const tick = (now) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);
      setDisplay(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <>{display.toLocaleString()}</>;
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
