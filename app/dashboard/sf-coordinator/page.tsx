"use client";

import { useEffect, useState } from "react";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";

export default function SFCoordinatorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const userRes = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (userRes.ok) {
      const userData = await userRes.json();
      setUser(userData);
    }

    const leaveRes = await fetch("/api/leaves/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await leaveRes.json();

    // ensure array
    const leaveArray = Array.isArray(data) ? data : [];

    const filtered = leaveArray.filter(
      (l: any) =>
        l.courseType === "self_financing" &&
        l.approvals?.sfCoordinator === "pending"
    );

    setLeaves(filtered);

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

  const approveLeave = async (id: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/leaves/${id}/sf-approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Failed to approve leave");
      return;
    }

    setLeaves((prev) => prev.filter((leave) => leave._id !== id));
  };

  const rejectLeave = async (id: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/leaves/${id}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Failed to reject leave");
      return;
    }

    setLeaves((prev) => prev.filter((leave) => leave._id !== id));
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
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
          <p className="text-gray-400">SF Coordinator</p>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">

        <h2 className="text-xl font-semibold mb-6">
          Self Financing Leave Requests
        </h2>

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3 text-left">Teacher</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-left">Leave</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>

            {leaves.map((leave) => (
              <tr key={leave._id} className="border-b border-gray-800">

                <td className="p-3">{leave.teacherName}</td>

                <td className="p-3">{leave.department}</td>

                <td className="p-3">{leave.from}</td>

                <td className="p-3">{leave.to}</td>

                <td className="p-3 text-xs text-gray-400">
                  {leave.leaveType} • {leave.session}
                </td>

                <td className="p-3 space-x-2">

                  <button
                    onClick={() => approveLeave(leave._id)}
                    className="bg-green-600 px-3 py-1 rounded text-xs"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => rejectLeave(leave._id)}
                    className="bg-red-600 px-3 py-1 rounded text-xs"
                  >
                    Reject
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}