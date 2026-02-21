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
