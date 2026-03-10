"use client";

import { useEffect, useState } from "react";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";

export default function PrincipalDashboard() {
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      // 🔹 Fetch user
      const userRes = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      // 🔹 Fetch all leaves (SAFE VERSION)
      const leaveRes = await fetch("/api/leaves/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!leaveRes.ok) {
        console.error("Leave API Error:", leaveRes.status);
        setLeaves([]);
      } else {
        const text = await leaveRes.text();

        if (!text) {
          console.error("Empty response from leave API");
          setLeaves([]);
        } else {
          const leaveData = JSON.parse(text);
          setLeaves(Array.isArray(leaveData) ? leaveData : []);
        }
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, status: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`/api/leaves/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    alert("Failed to update leave");
    return;
  }

  // 🔥 Instantly update UI
  setLeaves((prev) =>
    prev.map((leave) =>
      leave._id === id ? { ...leave, status } : leave
    )
  );
};
  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;
  const rejectedCount = leaves.filter(l => l.status === "rejected").length;

  if (loading) {
    return (
      <div className="text-white">Loading...</div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Profile */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-6">
        <ProfilePhotoUploader
          currentPhoto={user?.photo}
          onUploadSuccess={(url) =>
            setUser({ ...user, photo: url })
          }
        />
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-400">{user?.department}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
        </div>

        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
        </div>

        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">Leave Requests</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3 text-left">Teacher</th>
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
<tbody>
  {leaves
    .filter((leave) => leave.courseType === "aided")
    .map((leave) => (
    <tr key={leave._id} className="border-b border-gray-800">
      <td className="p-3">{leave.teacherName}</td>
      <td className="p-3">{leave.from}</td>
      <td className="p-3">{leave.to}</td>
      <td className="p-3">
  <div className="text-sm">{leave.reason}</div>

  <div className="text-xs text-gray-400 mt-1">
    {leave.leaveType} • {leave.session}
  </div>
</td>

      <td className="p-3 space-x-2">

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

        {leave.status === "pending" && (
          <>
            <button
              onClick={() => updateStatus(leave._id, "approved")}
              className="bg-green-600 px-3 py-1 rounded text-xs"
            >
              Approve
            </button>

            <button
              onClick={() => updateStatus(leave._id, "rejected")}
              className="bg-red-600 px-3 py-1 rounded text-xs"
            >
              Reject
            </button>
          </>
        )}
      </td>
    </tr>
  ))}
</tbody>
        </table>

      </div>
    </div>
  );
}