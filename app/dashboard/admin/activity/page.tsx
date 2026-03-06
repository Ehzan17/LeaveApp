"use client";

import { useEffect, useState } from "react";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/admin/activity", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setLogs);
  }, []);

  const filteredLogs = logs.filter(log =>
    roleFilter === "all" ? true : log.role === roleFilter
  );

  return (
    <div className="space-y-8">

      <h2 className="text-2xl font-bold">Activity Logs</h2>

      <div className="flex gap-4">
        <select
          className="bg-black border border-gray-700 p-2 rounded-lg"
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="teacher">Teacher</option>
          <option value="principal">Principal</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
        {filteredLogs.map((log) => (
          <div key={log._id} className="border-b border-gray-800 pb-3 text-sm">
            <div className="text-gray-400">{log.message}</div>
            <div className="text-xs text-gray-600">
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}