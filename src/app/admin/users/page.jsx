"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingSelectedUser, setEditingSelectedUser] = useState(false);
  const [selectedUserForm, setSelectedUserForm] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    profileImage: ""
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const raw = localStorage.getItem("user");
      const parsed = raw ? JSON.parse(raw) : null;
      setCurrentUserId(parsed?.id || null);
    } catch {
      setCurrentUserId(null);
    }

    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch users");
      }
      setUsers(data);
    } catch (fetchError) {
      console.error("Failed to fetch users:", fetchError);
      setError(fetchError.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newUser.name || !newUser.email || !newUser.password) {
      setError("Name, email and password are required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create user");
      }

      setUsers((prev) => [data, ...prev]);
      setNewUser({ name: "", email: "", password: "", role: "USER", profileImage: "" });
      setSuccess(`Created user ${data.name}`);
    } catch (createError) {
      setError(createError.message || "Failed to create user");
    }
  };

  const updateRole = async (userId, role) => {
    setBusyUserId(userId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update role");
      }

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: data.role } : u)));
      setSuccess(`Updated role for ${data.name}`);
    } catch (updateError) {
      setError(updateError.message || "Failed to update role");
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (user) => {
    const ok = window.confirm(`Delete user "${user.name}" (${user.email})?`);
    if (!ok) return;

    setBusyUserId(user.id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccess(`Deleted ${user.name}`);
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete user");
    } finally {
      setBusyUserId(null);
    }
  };

  const openUserDetails = async (userId) => {
    setDetailsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load user details");
      }
      setSelectedUser(data);
      setSelectedUserForm(data);
      setEditingSelectedUser(false);
    } catch (detailsError) {
      setError(detailsError.message || "Failed to load user details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const saveSelectedUser = async () => {
    if (!selectedUser || !selectedUserForm) return;
    setBusyUserId(selectedUser.id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedUserForm)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update user");

      setSelectedUser(data);
      setSelectedUserForm(data);
      setUsers((prev) => prev.map((u) => (u.id === data.id ? { ...u, ...data } : u)));
      setEditingSelectedUser(false);
      setSuccess(`Updated ${data.name}`);
    } catch (saveError) {
      setError(saveError.message || "Failed to update user");
    } finally {
      setBusyUserId(null);
    }
  };

  const onCreateUserImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Image is too large. Max size is 3MB.");
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      setNewUser((prev) => ({ ...prev, profileImage: dataUrl }));
      setError("");
    } catch {
      setError("Could not read image file");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Access</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">User Management</h2>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}

      <form onSubmit={createUser} className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">Add User</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input
            value={newUser.name}
            onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
            placeholder="Name"
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          />
          <input
            value={newUser.email}
            onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
            placeholder="Email"
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          />
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
            placeholder="Password"
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${roleSelectClasses(newUser.role)}`}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button type="submit" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
            Add User
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={onCreateUserImage}
            className="text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-cyan-100"
          />
          {newUser.profileImage ? (
            <img src={newUser.profileImage} alt="new-user" className="h-10 w-10 rounded-full object-cover border border-white/20" />
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Avatar</th>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Name</th>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Email</th>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Role</th>
                <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => openUserDetails(user.id)}
                >
                  <td className="px-5 py-4">
                    <img
                      src={user.profileImage || avatarFallback(user.name)}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover border border-white/20"
                    />
                  </td>
                  <td className="px-5 py-4 text-sm text-white">{user.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-300">{user.email}</td>
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      disabled={busyUserId === user.id || currentUserId === user.id}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${roleSelectClasses(user.role)}`}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={busyUserId === user.id || currentUserId === user.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUser(user);
                      }}
                      className="rounded-lg bg-rose-500/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyUserId === user.id ? "Working..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailsLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl border border-white/20 bg-slate-900 p-6 text-slate-200">
            Loading user details...
          </div>
        </div>
      ) : null}

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.profileImage || avatarFallback(selectedUser.name)}
                  alt={selectedUser.name}
                  className="h-14 w-14 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h3 className="text-2xl font-semibold text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-300">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedUserForm(null);
                  setEditingSelectedUser(false);
                }}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-sm text-white hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {!editingSelectedUser ? (
              <>
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setEditingSelectedUser(true)}
                    className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    Edit User
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Info label="Role" value={<RolePill role={selectedUser.role} />} />
                  <Info label="Providers" value={(selectedUser.authProviders || []).join(", ") || "-"} />
                  <Info label="Meals Tracked" value={selectedUser.mealsCount} />
                  <Info label="Foods Tracked" value={selectedUser.foodsTrackedCount} />
                  <Info label="Height (cm)" value={selectedUser.heightCm} />
                  <Info label="Weight (kg)" value={selectedUser.weightKg} />
                  <Info label="Age" value={selectedUser.age} />
                  <Info label="Sex" value={selectedUser.sex} />
                  <Info label="Activity Level" value={selectedUser.activityLevel} />
                  <Info label="Goal Type" value={selectedUser.goalType} />
                  <Info label="Daily Calories" value={selectedUser.dailyCalorieTarget} />
                  <Info label="Protein Goal" value={selectedUser.proteinGoal} />
                  <Info label="Carbs Goal" value={selectedUser.carbsGoal} />
                  <Info label="Fat Goal" value={selectedUser.fatGoal} />
                  <Info label="Meal Reminders" value={selectedUser.notifyMealReminders ? "Enabled" : "Disabled"} />
                  <Info label="Weekly Summary" value={selectedUser.notifyWeeklySummary ? "Enabled" : "Disabled"} />
                  <Info label="Created" value={formatDate(selectedUser.createdAt)} />
                  <Info label="Updated" value={formatDate(selectedUser.updatedAt)} />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUserForm?.profileImage || avatarFallback(selectedUserForm?.name)}
                    alt={selectedUserForm?.name}
                    className="h-16 w-16 rounded-full object-cover border border-white/20"
                  />
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await toDataUrl(file);
                          setSelectedUserForm((p) => ({ ...p, profileImage: dataUrl }));
                        } catch {
                          setError("Could not read image file");
                        } finally {
                          e.target.value = "";
                        }
                      }}
                      className="text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-cyan-100"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedUserForm((p) => ({ ...p, profileImage: null }))}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Remove image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Name" value={selectedUserForm?.name} onChange={(v) => setSelectedUserForm((p) => ({ ...p, name: v }))} />
                  <Field label="Email" value={selectedUserForm?.email} onChange={(v) => setSelectedUserForm((p) => ({ ...p, email: v }))} />
                  <Field label="Role" type="select" options={["USER", "ADMIN"]} value={selectedUserForm?.role} onChange={(v) => setSelectedUserForm((p) => ({ ...p, role: v }))} />
                  <Field label="Height (cm)" type="number" value={selectedUserForm?.heightCm} onChange={(v) => setSelectedUserForm((p) => ({ ...p, heightCm: v }))} />
                  <Field label="Weight (kg)" type="number" value={selectedUserForm?.weightKg} onChange={(v) => setSelectedUserForm((p) => ({ ...p, weightKg: v }))} />
                  <Field label="Age" type="number" value={selectedUserForm?.age} onChange={(v) => setSelectedUserForm((p) => ({ ...p, age: v }))} />
                  <Field label="Sex" value={selectedUserForm?.sex} onChange={(v) => setSelectedUserForm((p) => ({ ...p, sex: v }))} />
                  <Field label="Activity Level" value={selectedUserForm?.activityLevel} onChange={(v) => setSelectedUserForm((p) => ({ ...p, activityLevel: v }))} />
                  <Field label="Goal Type" value={selectedUserForm?.goalType} onChange={(v) => setSelectedUserForm((p) => ({ ...p, goalType: v }))} />
                  <Field label="Daily Calories" type="number" value={selectedUserForm?.dailyCalorieTarget} onChange={(v) => setSelectedUserForm((p) => ({ ...p, dailyCalorieTarget: v }))} />
                  <Field label="Protein Goal" type="number" value={selectedUserForm?.proteinGoal} onChange={(v) => setSelectedUserForm((p) => ({ ...p, proteinGoal: v }))} />
                  <Field label="Carbs Goal" type="number" value={selectedUserForm?.carbsGoal} onChange={(v) => setSelectedUserForm((p) => ({ ...p, carbsGoal: v }))} />
                  <Field label="Fat Goal" type="number" value={selectedUserForm?.fatGoal} onChange={(v) => setSelectedUserForm((p) => ({ ...p, fatGoal: v }))} />
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedUserForm?.notifyMealReminders)}
                      onChange={(e) => setSelectedUserForm((p) => ({ ...p, notifyMealReminders: e.target.checked }))}
                    />
                    Meal reminders
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedUserForm?.notifyWeeklySummary)}
                      onChange={(e) => setSelectedUserForm((p) => ({ ...p, notifyWeeklySummary: e.target.checked }))}
                    />
                    Weekly summary
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={busyUserId === selectedUser.id}
                    onClick={saveSelectedUser}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSelectedUser(false);
                      setSelectedUserForm(selectedUser);
                    }}
                    className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-white">{value ?? "-"}</p>
    </div>
  );
}

function RolePill({ role }) {
  const normalized = String(role || "USER").toUpperCase();
  const isAdmin = normalized === "ADMIN";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${
        isAdmin
          ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-100"
          : "border-violet-300/60 bg-violet-400/15 text-violet-100"
      }`}
    >
      {normalized}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function Field({ label, value, onChange, type = "text", options = [] }) {
  const isRoleSelect = type === "select" && options.includes("ADMIN") && options.includes("USER");
  return (
    <div>
      <label className="mb-1 block text-sm text-white/70">{label}</label>
      {type === "select" ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm ${
            isRoleSelect ? roleSelectClasses(value) : "border-white/15 bg-black/30 text-white"
          }`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
        />
      )}
    </div>
  );
}

function avatarFallback(name) {
  const label = (name || "U").slice(0, 1).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='#1e293b'/><text x='50%' y='56%' dominant-baseline='middle' text-anchor='middle' fill='#e2e8f0' font-size='28' font-family='Arial'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function roleSelectClasses(role) {
  const normalized = String(role || "USER").toUpperCase();
  if (normalized === "ADMIN") {
    return "border-cyan-300/40 bg-cyan-500/15 text-cyan-100";
  }
  return "border-violet-300/40 bg-violet-500/15 text-violet-100";
}
