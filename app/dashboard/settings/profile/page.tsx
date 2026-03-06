"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setForm(data);
      });
  }, []);

  const handleUpdate = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(form),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Profile updated successfully");

  router.push(`/dashboard/${user.role}`);
};

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto bg-[#111] p-10 rounded-2xl border border-gray-800 shadow-2xl space-y-6">

      <h2 className="text-3xl font-semibold mb-6">Edit Profile</h2>

      <div className="grid md:grid-cols-2 gap-6">

        <input
          type="text"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full Name"
          className="w-full bg-black border border-gray-700 p-3 rounded-lg"
        />

        <input
          type="text"
          value={form.department || ""}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="Department"
          className="w-full bg-black border border-gray-700 p-3 rounded-lg"
        />

        <input
          type="text"
          value={form.phone || ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          className="w-full bg-black border border-gray-700 p-3 rounded-lg"
        />

        <input
          type="text"
          value={form.designation || ""}
          onChange={(e) => setForm({ ...form, designation: e.target.value })}
          placeholder="Designation"
          className="w-full bg-black border border-gray-700 p-3 rounded-lg"
        />

        <input
          type="text"
          value={form.qualification || ""}
          onChange={(e) => setForm({ ...form, qualification: e.target.value })}
          placeholder="Qualification"
          className="w-full bg-black border border-gray-700 p-3 rounded-lg"
        />

        <input
          type="number"
          value={form.experience || ""}
          onChange={(e) => setForm({ ...form, experience: e.target.value })}
          placeholder="Years of Experience"
          className="w-full bg-black border border-gray-700 p-3 rounded-lg"
        />

      </div>

      <textarea
        value={form.address || ""}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        placeholder="Address"
        className="w-full bg-black border border-gray-700 p-3 rounded-lg"
      />

      <textarea
        value={form.bio || ""}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        placeholder="Short Bio"
        className="w-full bg-black border border-gray-700 p-3 rounded-lg"
      />

      <button
        onClick={handleUpdate}
        className="mt-4 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
      >
        Save Changes
      </button>

    </div>
  );
}