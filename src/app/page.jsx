"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    // ✅ save token + user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("admin", data.admin.role);

    // ✅ redirect by role (handle ADMIN/USER or admin/user)
    const role = String(data.user.role || "").toUpperCase();

    if (role === "ADMIN") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/user";
    }
  } catch (err) {
    console.error(err);
    setError("Server not responding");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">Login</h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            className="w-full border p-3 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button className="w-full bg-indigo-600 text-white py-3 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
