"use client";

import { useEffect, useState } from "react";

export default function PrincipalApprovals() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/leaves/all", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setLeaves(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");

    await fetch(`/api/leaves/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    // Update instantly in UI
    setLeaves((prev) =>
      prev.map((l) =>
        l._id === id ? { ...l, status } : l
      )
    );
  };

  const filteredLeaves = leaves.filter((leave) => {
    const statusMatch =
      statusFilter === "all" || leave.status === statusFilter;

    const deptMatch =
      departmentFilter === "all" ||
      leave.teacherDepartment === departmentFilter;

    return statusMatch && deptMatch;
  });

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-8">

      <h2 className="text-2xl font-bold">Approve Leaves</h2>

      {/* Filters */}
      <div className="flex gap-4">

        <select
          value={statusFilter}
          className="bg-black border border-gray-700 p-2 rounded-lg"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={departmentFilter}
          className="bg-black border border-gray-700 p-2 rounded-lg"
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="all">All Departments</option>
          {[...new Set(leaves.map((l) => l.teacherDepartment))].map(
            (dept) => (
              <option key={dept}>{dept}</option>
            )
          )}
        </select>

        <button
          onClick={() => fetchLeaves()}
          className="bg-red-600 px-4 py-2 rounded-lg"
        >
          Apply
        </button>

      </div>

      {/* Leave Cards */}
      <div className="grid gap-6">

        {filteredLeaves.map((leave) => (
          <div
            key={leave._id}
            className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex justify-between items-center"
          >

            {/* Left */}
            <div className="flex items-center gap-6">

              <img
                src={leave.teacherPhoto || "/avatar.png"}
                className="w-14 h-14 rounded-full object-cover"
              />

              <div>
                <p className="font-semibold">
                  {leave.teacherName}
                </p>
                <p className="text-sm text-gray-400">
                  {leave.teacherDepartment}
                </p>
                <p className="text-sm mt-2">
                  {leave.from} → {leave.to}
                </p>
                <p className="text-sm text-gray-400">
                  {leave.reason}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex gap-3 items-center">

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
                    className="bg-green-600 px-4 py-2 rounded-lg"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(leave._id, "rejected")}
                    className="bg-red-600 px-4 py-2 rounded-lg"
                  >
                    Reject
                  </button>
                </>
              )}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}