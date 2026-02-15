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

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setFormData(parsed);
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updated = await res.json();
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
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
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Full Name
              </label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email Address
              </label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg font-medium transition duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(user);
                  setError("");
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-medium border border-white/20 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
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
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold capitalize">
                  {user?.role?.toLowerCase() || "User"}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg font-medium transition duration-200"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Info Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <p className="text-white/70">
            <span className="text-white/60">Account Status:</span> <span className="text-green-400 font-medium">Active</span>
          </p>
          <p className="text-white/70">
            <span className="text-white/60">Member Since:</span> <span className="text-white">{new Date().toLocaleDateString()}</span>
          </p>
          <p className="text-white/70">
            <span className="text-white/60">Last Updated:</span> <span className="text-white">Just now</span>
          </p>
        </div>
      </div>
    </div>
  );
}
