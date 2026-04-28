"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [riskAlerts, setRiskAlerts] = useState<string[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setRecent(data.recentActivity || []);
        setInsights(data.insights);
        setRiskAlerts(data.riskAlerts || []);
        setChartData([
          { name: "Approved", value: data.stats?.approvedLeaves || 0 },
          { name: "Pending", value: data.stats?.pendingLeaves || 0 },
          { name: "Rejected", value: data.stats?.rejectedLeaves || 0 },
        ]);
      });
  }, []);

  if (!stats) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Users" value={stats.totalUsers} />
        <StatCard title="Teachers" value={stats.totalTeachers} />
        <StatCard title="Leaves" value={stats.totalLeaves} />
        <StatCard title="Pending" value={stats.pendingLeaves} highlight />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
          <h3 className="mb-4 text-lg font-semibold">Leave Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} dataKey="value" outerRadius={80} label>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
          <h3 className="mb-4 text-lg font-semibold">System Stats</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Users", value: stats.totalUsers },
                { name: "Teachers", value: stats.totalTeachers },
                { name: "Leaves", value: stats.totalLeaves },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#b91c1c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Insights</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>{stats.pendingLeaves} leaves are currently pending approval</li>
            <li>
              Approval Rate:{" "}
              {Math.round((stats.approvedLeaves / stats.totalLeaves) * 100) || 0}%
            </li>
            <li>
              Rejection Rate:{" "}
              {Math.round((stats.rejectedLeaves / stats.totalLeaves) * 100) || 0}%
            </li>
            <li>
              Most frequent reason:{" "}
              {insights?.mostFrequentReason
                ? `${insights.mostFrequentReason.reason} (${insights.mostFrequentReason.count})`
                : "Not enough data"}
            </li>
            <li>
              Peak leave month:{" "}
              {insights?.peakLeaveMonth
                ? `${insights.peakLeaveMonth.month} (${insights.peakLeaveMonth.count})`
                : "Not enough data"}
            </li>
            <li>
              Average leave days per teacher:{" "}
              {insights?.averageLeaveDaysPerTeacher || 0}
            </li>
          </ul>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Alerts</h3>
          {riskAlerts.length === 0 ? (
            <p className="text-sm text-gray-400">No risk alerts detected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {riskAlerts.map((alert, index) => (
                <span
                  key={`${alert}-${index}`}
                  className="rounded-full bg-yellow-500/10 px-3 py-2 text-sm text-yellow-300"
                >
                  {alert}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-2 text-sm text-gray-400">
          {recent.map((log) => (
            <div key={log._id} className="border-b border-gray-800 pb-2">
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
    <div
      className={`p-5 rounded-xl border border-gray-800 bg-[#111] ${
        highlight ? "ring-2 ring-yellow-500" : ""
      }`}
    >
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
