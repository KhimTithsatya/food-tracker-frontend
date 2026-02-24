const BASE_URL = "http://localhost:5001/api/users";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) throw new Error((data && data.message) || `Request failed (${res.status})`);
  return data;
}

export function userDashboard() {
  return request("/dashboard"); // GET /api/users/dashboard
}

export function userMeals(params = {}) {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.mealType) query.set("mealType", params.mealType);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request(`/meals${suffix}`); // GET /api/users/meals
}
