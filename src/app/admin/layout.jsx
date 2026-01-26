"use client";

import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      window.location.href = "/";
      return;
    }

    if (role !== "admin") {
      window.location.href = "/user";
      return;
    }

    setReady(true);
  }, []);

  if (!ready) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r p-4">Admin Menu</aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
