"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

const ACTIVITY_OPTIONS = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"];
const GOAL_OPTIONS = ["LOSE", "MAINTAIN", "GAIN"];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [deletePassword, setDeletePassword] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchProfile();
    fetchSessions();
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load profile");

      setUser(data);
      setFormData(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load sessions");
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      setUser(data);
      setFormData(data);
      localStorage.setItem("user", JSON.stringify(data));
      setSuccess("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Current and new password are required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to change password");

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess(data?.message || "Password updated");
      logoutAndRedirect();
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setBusy(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!confirm("Log out all devices? You will need to sign in again.")) return;
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/users/sessions/logout-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to log out sessions");
      setSuccess(data?.message || "Logged out all sessions");
      logoutAndRedirect();
    } catch (err) {
      setError(err.message || "Failed to log out sessions");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/api/users/me/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to export data");

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-food-tracker-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("Export complete");
    } catch (err) {
      setError(err.message || "Failed to export data");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError("Enter password to delete account");
      return;
    }
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;

    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete account");

      logoutAndRedirect();
    } catch (err) {
      setError(err.message || "Failed to delete account");
    } finally {
      setBusy(false);
    }
  };

  const onProfileImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Max size is 5MB.");
      return;
    }

    try {
      const compressed = await compressAvatar(file, { size: 320, quality: 0.85 });
      setFormData((prev) => ({ ...prev, profileImage: compressed }));
      setError("");
    } catch {
      setError("Could not read this image. Try JPG or PNG.");
    } finally {
      e.target.value = "";
    }
  };

  const logoutAndRedirect = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-flex items-center gap-2">
          <div className="animate-spin">⏳</div>
          <span className="text-white/70">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Profile & Security</h1>
        <p className="mt-2 text-white/60">Manage your account, health settings, and privacy controls.</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">{success}</div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Personal Profile</h2>
            <p className="text-sm text-white/60">Identity, goals, preferences, and notifications</p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Edit
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={formData.profileImage || avatarFallback(formData.name)}
              alt="Profile"
              className="h-20 w-20 rounded-full border border-white/20 object-cover"
            />
            {editing ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onProfileImageSelect}
                  className="text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-3 file:py-2 file:text-white"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, profileImage: null }))}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Remove image
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Name" value={formData.name} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, name: v }))} />
            <Input label="Email" value={formData.email} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, email: v }))} />
            <Input label="Height (cm)" type="number" value={formData.heightCm} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, heightCm: v }))} />
            <Input label="Weight (kg)" type="number" value={formData.weightKg} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, weightKg: v }))} />
            <Input label="Age" type="number" value={formData.age} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, age: v }))} />
            <Input label="Sex" value={formData.sex} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, sex: v }))} />
            <Select label="Activity Level" value={formData.activityLevel} disabled={!editing} options={ACTIVITY_OPTIONS} onChange={(v) => setFormData((p) => ({ ...p, activityLevel: v }))} />
            <Select label="Goal Type" value={formData.goalType} disabled={!editing} options={GOAL_OPTIONS} onChange={(v) => setFormData((p) => ({ ...p, goalType: v }))} />
            <Input label="Daily Calories" type="number" value={formData.dailyCalorieTarget} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, dailyCalorieTarget: v }))} />
            <Input label="Protein Goal (g)" type="number" value={formData.proteinGoal} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, proteinGoal: v }))} />
            <Input label="Carbs Goal (g)" type="number" value={formData.carbsGoal} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, carbsGoal: v }))} />
            <Input label="Fat Goal (g)" type="number" value={formData.fatGoal} disabled={!editing} onChange={(v) => setFormData((p) => ({ ...p, fatGoal: v }))} />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={Boolean(formData.notifyMealReminders)}
                disabled={!editing}
                onChange={(e) => setFormData((p) => ({ ...p, notifyMealReminders: e.target.checked }))}
              />
              Meal reminders
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={Boolean(formData.notifyWeeklySummary)}
                disabled={!editing}
                onChange={(e) => setFormData((p) => ({ ...p, notifyWeeklySummary: e.target.checked }))}
              />
              Weekly summary
            </label>
          </div>

          {editing ? (
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
              >
                Save profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(user || {});
                }}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          ) : null}
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold text-white">Security</h2>
        <form onSubmit={handleChangePassword} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))}
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60 md:col-span-3 md:w-fit"
          >
            Change Password
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white">Sessions & Devices</h2>
          <button
            type="button"
            onClick={handleLogoutAllSessions}
            disabled={busy}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
          >
            Log out all devices
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {sessions.length ? (
            sessions.map((session) => (
              <div key={session.id} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
                <p className="font-semibold text-white">
                  {session.isCurrent ? "Current Session" : "Active Session"}
                </p>
                <p>User Agent: {session.userAgent || "-"}</p>
                <p>IP: {session.ipAddress || "-"}</p>
                <p>Created: {formatDate(session.createdAt)}</p>
                <p>Last Active: {formatDate(session.lastActiveAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/60">No active sessions found.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold text-white">Privacy & Data</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={busy}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
          >
            Export My Data (JSON)
          </button>
        </div>
        <div className="mt-6 max-w-md space-y-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-semibold text-red-200">Delete Account</p>
          <p className="text-xs text-red-100/90">This action is permanent. Enter password to confirm.</p>
          <input
            type="password"
            placeholder="Password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="w-full rounded-lg border border-red-300/40 bg-black/30 px-3 py-2 text-sm text-white outline-none"
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleDeleteAccount}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-white/70">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:opacity-70"
      />
    </div>
  );
}

function Select({ label, value, options, onChange, disabled = false }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-white/70">{label}</label>
      <select
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:opacity-70"
      >
        <option value="">-</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function avatarFallback(name) {
  const label = (name || "U").slice(0, 1).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='#1e293b'/><text x='50%' y='56%' dominant-baseline='middle' text-anchor='middle' fill='#e2e8f0' font-size='56' font-family='Arial'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function compressAvatar(file, { size = 320, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        const srcSize = Math.min(image.width, image.height);
        const sx = (image.width - srcSize) / 2;
        const sy = (image.height - srcSize) / 2;

        ctx.drawImage(image, sx, sy, srcSize, srcSize, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = () => reject(new Error("Failed to process image"));
      image.src = String(reader.result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}
