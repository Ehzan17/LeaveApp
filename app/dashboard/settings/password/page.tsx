"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("All fields are required ❌");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters ❌");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");

      const res = await fetch("/api/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update password ❌");
      } else {
        toast.success("Password updated successfully ✅");
        setForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

    } catch {
      toast.error("Something went wrong ⚠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">

      {/* Glow BG */}
      <div className="absolute w-[400px] h-[400px] bg-red-600/20 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl bottom-0 right-0"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">

        <h2 className="text-2xl font-semibold text-center">
          Change Password
        </h2>

        <div className="space-y-4">

          <input
            type="password"
            placeholder="Old Password"
            value={form.oldPassword}
            onChange={(e) =>
              setForm({ ...form, oldPassword: e.target.value })
            }
            className="w-full px-4 py-3 bg-[#0b0f19] border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
          />

          <input
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={(e) =>
              setForm({ ...form, newPassword: e.target.value })
            }
            className="w-full px-4 py-3 bg-[#0b0f19] border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="w-full px-4 py-3 bg-[#0b0f19] border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={handleChange}
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

        </div>

      </div>
    </div>
  );
}