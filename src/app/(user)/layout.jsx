"use client";

import { useEffect, useState } from "react";

export default function UserLayout({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      window.location.href = "/";
      return;
    }

    // optional: if admin goes to /user, redirect to /admin
    if (role === "admin") {
      window.location.href = "/admin";
      return;
    }

    setReady(true);
  }, []);

  if (!ready) return <p className="p-6">Loading...</p>;

  return <div className="min-h-screen bg-gray-100 p-6">{children}</div>;
}