"use client";

import { useEffect, useState } from "react";

export default function TeacherLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/leaves", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setLeaves(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = leaves
    .filter((leave) =>
      statusFilter === "all" ? true : leave.status === statusFilter
    )
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-8">

      <h2 className="text-2xl font-bold">My Leave Applications</h2>

      {/* Filters */}
      <div className="flex gap-4">

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black border border-gray-700 p-2 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-black border border-gray-700 p-2 rounded-lg"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

      </div>

      {/* Leave Cards */}
      <div className="grid gap-6">

        {filteredLeaves.map((leave) => (
          <div
            key={leave._id}
            className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex justify-between items-center"
          >

            <div>
              <p className="text-sm text-gray-400">
                {leave.from} → {leave.to}
              </p>

              <p className="mt-2">{leave.reason}</p>

              <span
                className={`mt-3 inline-block px-3 py-1 rounded-full text-xs ${
                  leave.status === "approved"
                    ? "bg-green-600/20 text-green-400"
                    : leave.status === "rejected"
                    ? "bg-red-600/20 text-red-400"
                    : "bg-yellow-600/20 text-yellow-400"
                }`}
              >
                {leave.status}
              </span>
            </div>

            {/* PDF Download */}
            {leave.status === "approved" && leave.pdfUrl && (
              <a
                href={leave.pdfUrl}
                target="_blank"
                className="bg-red-600 px-4 py-2 rounded-lg text-sm"
              >
                Download PDF
              </a>
            )}

                 {/* PDF Download */}
            {leave.status === "rejected" && leave.pdfUrl && (
              <a
                href={leave.pdfUrl}
                target="_blank"
                className="bg-red-600 px-4 py-2 rounded-lg text-sm"
              >
                Download PDF
              </a>
            )}


          </div>
        ))}

      </div>

    </div>
  );
}