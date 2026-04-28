"use client";

import { useEffect, useState } from "react";

export default function TeacherLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch("/api/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      // ✅ FIX: ensure array
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // ✅ SAFE FILTER + SORT
  const filteredLeaves = (Array.isArray(leaves) ? leaves : [])
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
            className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex justify-between items-center hover:bg-[#1a1a1a] transition"
          >

            <div>

              {/* ✅ FIXED DATE FORMAT */}
              <p className="text-sm text-gray-400">
                {new Date(leave.from).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                →{" "}
                {new Date(leave.to).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <p className="mt-2">{leave.reason}</p>

              {/* ✅ CLEAN STATUS BADGE */}
              <span
                className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  leave.status === "approved"
                    ? "bg-green-500/20 text-green-400"
                    : leave.status === "rejected"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {leave.status.toUpperCase()}
              </span>

            </div>

            {/* ✅ PDF DOWNLOAD (both approved + rejected) */}
            {leave.pdfUrl && (
              <a
                href={leave.pdfUrl}
                target="_blank"
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
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