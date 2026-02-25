"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profileImage: "",
    notifyMealReminders: false,
    notifyWeeklySummary: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load profile");
      setProfile((prev) => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to save profile");

      setProfile(data);
      localStorage.setItem("user", JSON.stringify(data));
      setSuccess("Profile updated");
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
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
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to change password");

      setSuccess("Password changed. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to change password");
      setSaving(false);
    }
  };

  const onProfileImageSelect = async (e) => {
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
      const imageData = await toDataUrl(file);
      setProfile((prev) => ({ ...prev, profileImage: imageData }));
      setError("");
    } catch (_err) {
      setError("Could not read image file");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
        Loading admin profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Account</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Admin Profile</h2>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Profile Information</h3>

          <div className="flex items-center gap-4">
            <img
              src={profile.profileImage || avatarFallback(profile.name)}
              alt="Profile"
              className="h-16 w-16 rounded-full border border-white/20 object-cover"
            />
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={onProfileImageSelect}
                className="text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-cyan-100"
              />
              <button
                type="button"
                onClick={() => setProfile((prev) => ({ ...prev, profileImage: null }))}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Remove image
              </button>
            </div>
          </div>

          <Input label="Name" value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
          <Input label="Email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={Boolean(profile.notifyMealReminders)}
              onChange={(e) => setProfile((p) => ({ ...p, notifyMealReminders: e.target.checked }))}
            />
            Meal reminders
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={Boolean(profile.notifyWeeklySummary)}
              onChange={(e) => setProfile((p) => ({ ...p, notifyWeeklySummary: e.target.checked }))}
            />
            Weekly summary
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form onSubmit={changePassword} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Security</h3>
          <p className="text-sm text-slate-400">Change your admin password</p>

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
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-300">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
      />
    </div>
  );
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function avatarFallback(name) {
  const label = (name || "A").slice(0, 1).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='#0f172a'/><text x='50%' y='56%' dominant-baseline='middle' text-anchor='middle' fill='#e2e8f0' font-size='56' font-family='Arial'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
