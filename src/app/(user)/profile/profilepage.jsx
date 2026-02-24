"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setUser(data);
      setFormData(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          profileImage: formData.profileImage || null
        })
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error((data && data.message) || "Failed to update profile");
      }

      setUser(data);
      setFormData(data);
      localStorage.setItem("user", JSON.stringify(data));
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
  };

  const onProfileImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }

    const maxBytes = 3 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Image is too large. Max size is 3MB.");
      return;
    }

    const dataUrl = await toDataUrl(file);
    setFormData((prev) => ({ ...prev, profileImage: dataUrl }));
    setError("");
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">👤 My Profile</h1>
        <p className="text-white/60 mt-2">Manage your account settings and preferences</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-200 text-sm font-medium">
          ✓ {success}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={formData.profileImage || avatarFallback(formData.name)}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover border border-white/20"
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/70 mb-2">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onProfileImageSelect}
                  className="w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, profileImage: null }))}
                  className="mt-2 text-xs text-white/60 hover:text-white"
                >
                  Remove image
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg font-medium">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(user);
                  setError("");
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-medium border border-white/20"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-white/10">
              <img
                src={user?.profileImage || avatarFallback(user?.name)}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover border border-white/20"
              />
              <div>
                <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Profile Photo</p>
                <p className="text-white/70 text-sm mt-1">Uploaded image visible in your account</p>
              </div>
            </div>

            <div className="pb-6 border-b border-white/10">
              <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Full Name</p>
              <p className="text-2xl font-semibold text-white mt-2">{user?.name || "Not Set"}</p>
            </div>

            <div className="pb-6 border-b border-white/10">
              <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Email Address</p>
              <p className="text-lg text-indigo-300 mt-2 font-medium">{user?.email || "Not Set"}</p>
            </div>

            <div className="pb-6 border-b border-white/10">
              <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Account Role</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-blue-300 text-sm font-semibold capitalize">
                  {user?.role?.toLowerCase() || "user"}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button onClick={() => setEditing(true)} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg font-medium">
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <p className="text-white/70">
            <span className="text-white/60">Account Status:</span> <span className="text-green-400 font-medium">Active</span>
          </p>
          <p className="text-white/70">
            <span className="text-white/60">Member Since:</span>{" "}
            <span className="text-white">{formatDate(user?.createdAt)}</span>
          </p>
          <p className="text-white/70">
            <span className="text-white/60">Last Updated:</span>{" "}
            <span className="text-white">{formatDate(user?.updatedAt)}</span>
          </p>
        </div>
      </div>
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
  const label = (name || "U").slice(0, 1).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='#1e293b'/><text x='50%' y='56%' dominant-baseline='middle' text-anchor='middle' fill='#e2e8f0' font-size='56' font-family='Arial'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}
