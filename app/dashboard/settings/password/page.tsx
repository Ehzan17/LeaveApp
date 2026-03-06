"use client";

import { useState } from "react";

export default function ChangePassword() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = async () => {
    setMessage("");

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

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
        setMessage(data.message);
      } else {
        setMessage("Password updated successfully ✅");
        setForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-[#111] border border-gray-800 p-6 rounded-xl shadow-lg">

      <h2 className="text-2xl mb-6 font-semibold">Change Password</h2>

      <div className="space-y-4">

        <input
          type="password"
          placeholder="Old Password"
          value={form.oldPassword}
          className="w-full bg-black border border-gray-700 p-3 rounded-lg focus:border-red-500 outline-none"
          onChange={(e) =>
            setForm({ ...form, oldPassword: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="New Password"
          value={form.newPassword}
          className="w-full bg-black border border-gray-700 p-3 rounded-lg focus:border-red-500 outline-none"
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          className="w-full bg-black border border-gray-700 p-3 rounded-lg focus:border-red-500 outline-none"
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        {message && (
          <p className="text-sm text-red-400">{message}</p>
        )}

        <button
          onClick={handleChange}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

      </div>

    </div>
  );
}