// frontend/src/services/admin.api.js

const BASE_URL = "http://localhost:5001/api/admin";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  // Try to parse JSON safely
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

// --------------------
// Admin Dashboard
// --------------------
export function adminDashboard() {
  return request("/dashboard", { method: "GET" });
}

// --------------------
// Users (Admin)
// --------------------
export function getAllUsers() {
  return request("/users", { method: "GET" });
}

export function updateUserRole(userId, role) {
  return request(`/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role })
  });
}

export function deleteUser(userId) {
  return request(`/users/${userId}`, { method: "DELETE" });
}

// --------------------
// Foods (Admin)
// --------------------
export function getAllFoods() {
  return request("/foods", { method: "GET" });
}

export function createFood(payload) {
  // payload: { name, calories }
  return request("/foods", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateFood(foodId, payload) {
  return request(`/foods/${foodId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteFood(foodId) {
  return request(`/foods/${foodId}`, { method: "DELETE" });
}

// --------------------
// Meals (Admin)
// --------------------
export function getAllMeals() {
  return request("/meals", { method: "GET" });
}

export function deleteMeal(mealId) {
  return request(`/meals/${mealId}`, { method: "DELETE" });
}

// --------------------
// Reports (Admin)
// --------------------
export function getAdminReportDaily(dateStr) {
  // dateStr example: "2026-01-28"
  const query = dateStr ? `?date=${encodeURIComponent(dateStr)}` : "";
  return request(`/reports/daily${query}`, { method: "GET" });
}

export function getAdminReportMonthly(monthStr) {
  // monthStr example: "2026-01"
  const query = monthStr ? `?month=${encodeURIComponent(monthStr)}` : "";
  return request(`/reports/monthly${query}`, { method: "GET" });
}
