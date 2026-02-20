// frontend/src/services/user.api.js

const BASE_URL = "http://localhost:5001/api/user";

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
// User Dashboard
// --------------------
export function userDashboard() {
  return request("/dashboard", { method: "GET" });
}

// --------------------
// User Meals
// --------------------
export function getMyMeals() {
  return request("/meals", { method: "GET" });
}

// --------------------
// User Foods
// --------------------
export function getFoods() {
  return request("/foods", { method: "GET" });
}
