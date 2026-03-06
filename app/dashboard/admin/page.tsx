"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setRecent(data.recentActivity);
      });
  }, []);

  if (!stats) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-10">

      <h2 className="text-2xl font-bold">System Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-6">

        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Teachers" value={stats.totalTeachers} />
        <StatCard title="Principals" value={stats.totalPrincipals} />
        <StatCard title="Total Leaves" value={stats.totalLeaves} />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} highlight />

      </div>

      {/* Recent Activity */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>

        <div className="space-y-3">
          {recent.map((log, index) => (
            <div key={index} className="text-sm text-gray-400 border-b border-gray-800 pb-2">
              {log.message}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, highlight }: any) {
  return (
    <div className={`p-6 rounded-xl border border-gray-800 bg-[#111] ${highlight ? "ring-1 ring-yellow-500" : ""}`}>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}