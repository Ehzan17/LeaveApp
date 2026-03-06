"use client";

import { useEffect, useState } from "react";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [form, setForm] = useState({
    from: "",
    to: "",
    reason: "",
  });

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    const userRes = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await userRes.json();
    setUser(userData);

    const leaveRes = await fetch("/api/leaves", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const leaveData = await leaveRes.json();
    setLeaves(leaveData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ from: "", to: "", reason: "" });
      fetchData(); // refresh without reload
    }
  };

  return (
    <div className="space-y-8">

      {/* Top Section */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Profile */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6">My Profile</h2>

          <div className="flex items-center gap-6">

            <ProfilePhotoUploader
              currentPhoto={user?.photo}
              onUploadSuccess={(url) =>
                setUser({ ...user, photo: url })
              }
            />
<div className="space-y-2 text-sm">
  <p><span className="text-gray-400">Name:</span> {user?.name}</p>
  <p><span className="text-gray-400">Email:</span> {user?.email}</p>
  <p><span className="text-gray-400">Department:</span> {user?.department}</p>
  <p><span className="text-gray-400">Designation:</span> {user?.designation || "—"}</p>
  <p><span className="text-gray-400">Qualification:</span> {user?.qualification || "—"}</p>
  <p><span className="text-gray-400">Experience:</span> {user?.experience ? `${user.experience} Years` : "—"}</p>
  <p><span className="text-gray-400">Phone:</span> {user?.phone}</p>
  <p><span className="text-gray-400">Address:</span> {user?.address || "—"}</p>
  <p><span className="text-gray-400">Bio:</span> {user?.bio || "—"}</p>
</div>

          </div>
        </div>

        {/* Apply Leave */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6">Apply Leave</h2>

          <div className="space-y-4">

            <div className="relative">
              <input
                type="date"
                value={form.from}
                className="w-full bg-black border border-gray-700 p-3 rounded-lg pr-10"
                onChange={(e) => setForm({ ...form, from: e.target.value })}
              />
              <span className="absolute right-3 top-3 text-gray-400">📅</span>
            </div>

            <div className="relative">
              <input
                type="date"
                value={form.to}
                className="w-full bg-black border border-gray-700 p-3 rounded-lg pr-10"
                onChange={(e) => setForm({ ...form, to: e.target.value })}
              />
              <span className="absolute right-3 top-3 text-gray-400">📅</span>
            </div>

            <textarea
              placeholder="Reason for leave"
              value={form.reason}
              className="w-full bg-black border border-gray-700 p-3 rounded-lg"
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg transition-all"
            >
              Submit Leave
            </button>

          </div>
        </div>

      </div>

      {/* Leave History */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">Leave History</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr
                key={leave._id}
                className="border-b border-gray-800 hover:bg-[#1a1a1a]"
              >
                <td className="p-3">{leave.from}</td>
                <td className="p-3">{leave.to}</td>
                <td className="p-3">{leave.reason}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      leave.status === "approved"
                        ? "bg-green-600/20 text-green-400"
                        : leave.status === "rejected"
                        ? "bg-red-600/20 text-red-400"
                        : "bg-yellow-600/20 text-yellow-400"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}