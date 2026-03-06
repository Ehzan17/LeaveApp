"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [form, setForm] = useState({
    from: "",
    to: "",
    reason: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUser);

    fetch("/api/leaves", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setLeaves);
  }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    await fetch("/api/leaves", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    alert("Leave submitted");
    window.location.reload();
  };

  return (
    <div className="space-y-8">

      {/* TOP CARDS */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Profile Card */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-lg">

          <h2 className="text-xl font-semibold mb-4">Profile</h2>

          <div className="flex items-center gap-6">

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>

            <div>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Department:</strong> {user?.department}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>

          </div>
        </div>

        {/* Apply Leave Card */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-lg">

          <h2 className="text-xl font-semibold mb-4">Apply Leave</h2>

          <div className="space-y-4">

            <input
              type="date"
              className="w-full bg-black border border-gray-700 p-3 rounded-lg"
              onChange={(e) => setForm({ ...form, from: e.target.value })}
            />

            <input
              type="date"
              className="w-full bg-black border border-gray-700 p-3 rounded-lg"
              onChange={(e) => setForm({ ...form, to: e.target.value })}
            />

            {/* Leave Type Placeholder */}
            <select
              className="w-full bg-black border border-gray-700 p-3 rounded-lg"
            >
              <option>Leave Type (Coming Soon)</option>
            </select>

            <textarea
              placeholder="Reason for leave"
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
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-lg">

        <h2 className="text-xl font-semibold mb-4">Leave History</h2>

        <div className="overflow-x-auto">

          <table className="w-full text-sm border-collapse">

            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">PDF</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id} className="border-b border-gray-800 hover:bg-[#1a1a1a]">
                  <td className="p-3">{leave.from}</td>
                  <td className="p-3">{leave.to}</td>
                  <td className="p-3">{leave.reason}</td>
                  <td className="p-3">{leave.status}</td>
                  <td className="p-3">
                    {leave.status === "approved" && (
                      <a
                        href={`/letters/${leave._id}.pdf`}
                        target="_blank"
                        className="text-red-500 hover:underline"
                      >
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}