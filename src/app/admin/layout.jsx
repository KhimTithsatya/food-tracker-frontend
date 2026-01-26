"use client";

import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, loading, isAdmin]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex" }}>
      <aside>Admin Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}
