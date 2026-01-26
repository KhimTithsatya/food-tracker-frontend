"use client";

import { useEffect, useState } from "react";
import { api } from "../../../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/users/dashboard")
      .then(setData)
      .catch(() => alert("Unauthorized"));
  }, []);

  return (
    <div>
      <h1>User Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

