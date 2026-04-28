"use client";

import { useEffect, useMemo, useState } from "react";

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [role, setRole] = useState("all");
  const [action, setAction] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const token = sessionStorage.getItem("token");
    setLoading(true);

    const params = new URLSearchParams({ role, action });
    const res = await fetch(`/api/admin/activity?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    setLogs(Array.isArray(data.logs) ? data.logs : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [role, action]);

  const actions = useMemo(
    () => ["all", ...Array.from(new Set(logs.map((log) => log.action).filter(Boolean)))],
    [logs]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <p className="mt-1 text-sm text-gray-400">
          Track leave, profile, approval, and system changes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-gray-800 bg-[#111] p-3"
        >
          <option value="all">All Roles</option>
          <option value="teacher">Teacher</option>
          <option value="sf_coordinator">SF Coordinator</option>
          <option value="manager">Manager</option>
          <option value="principal">Principal</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-xl border border-gray-800 bg-[#111] p-3"
        >
          {actions.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All Actions" : item}
            </option>
          ))}
        </select>

        <button
          onClick={fetchLogs}
          className="rounded-xl bg-red-600 px-4 py-3 hover:bg-red-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
        {loading ? (
          <p className="text-gray-400">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-400">No activity found</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log._id}
                className="rounded-xl border border-gray-800 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium">{log.message}</p>
                  <span className="text-xs text-gray-400">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                  <span className="rounded-full bg-white/5 px-3 py-1">
                    {log.role || "unknown"}
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1">
                    {log.action || "ACTION"}
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1">
                    {log.userName || "System"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
