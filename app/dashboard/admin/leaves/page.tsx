"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const leaveTypes = ["all", "CL", "VL", "OD", "DL", "CML"];
const statuses = ["all", "pending", "approved", "rejected"];

export default function AllLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    leaveType: "all",
    department: "all",
    fromDate: "",
    toDate: "",
  });

  const departments = useMemo(
    () => ["all", ...Array.from(new Set(leaves.map((l) => l.department).filter(Boolean)))],
    [leaves]
  );

  const queryString = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  };

  const fetchLeaves = async () => {
    const token = sessionStorage.getItem("token");
    setLoading(true);

    const res = await fetch(`/api/admin/leaves?${queryString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    setLeaves(Array.isArray(data.leaves) ? data.leaves : []);
    setSelected([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const bulkUpdate = async (status: "approved" | "rejected") => {
    const token = sessionStorage.getItem("token");

    if (selected.length === 0) {
      toast.error("Select at least one leave request");
      return;
    }

    const res = await fetch("/api/admin/leaves", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: selected, status }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Bulk update failed");
      return;
    }

    toast.success(data.message);
    fetchLeaves();
  };

  const exportCsv = async () => {
    const token = sessionStorage.getItem("token");
    const params = queryString();
    const res = await fetch(`/api/admin/leaves?${params}&export=csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Export failed");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leaves.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Leave Requests</h2>
          <p className="mt-1 text-sm text-gray-400">
            Filter, export, and process leave records.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="rounded-xl bg-gray-800 px-4 py-3 text-sm hover:bg-gray-700"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            placeholder="Search teacher"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="rounded-xl border border-gray-800 bg-black/30 p-3"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-xl border border-gray-800 bg-black/30 p-3"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Status" : status}
              </option>
            ))}
          </select>
          <select
            value={filters.leaveType}
            onChange={(e) =>
              setFilters({ ...filters, leaveType: e.target.value })
            }
            className="rounded-xl border border-gray-800 bg-black/30 p-3"
          >
            {leaveTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>
          <select
            value={filters.department}
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
            className="rounded-xl border border-gray-800 bg-black/30 p-3"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "all" ? "All Departments" : dept}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
            className="rounded-xl border border-gray-800 bg-black/30 p-3"
          />
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            className="rounded-xl border border-gray-800 bg-black/30 p-3"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={fetchLeaves}
            className="rounded-xl bg-red-600 px-4 py-3 hover:bg-red-700"
          >
            Apply Filters
          </button>
          <button
            onClick={() => bulkUpdate("approved")}
            className="rounded-xl bg-green-600 px-4 py-3 hover:bg-green-500"
          >
            Approve Selected
          </button>
          <button
            onClick={() => bulkUpdate("rejected")}
            className="rounded-xl bg-red-700 px-4 py-3 hover:bg-red-600"
          >
            Reject Selected
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 sm:p-6">
        {loading ? (
          <p className="text-gray-400">Loading leaves...</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="p-3 text-left">Select</th>
                    <th className="p-3 text-left">Teacher</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Days</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="border-b border-gray-800">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(leave._id)}
                          onChange={() => toggleSelected(leave._id)}
                        />
                      </td>
                      <td className="p-3">{leave.teacherName}</td>
                      <td className="p-3">{leave.department}</td>
                      <td className="p-3">{leave.leaveType}</td>
                      <td className="p-3">{leave.days}</td>
                      <td className="p-3">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="p-3">
                        <RiskBadges alerts={leave.riskAlerts || []} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {leaves.map((leave) => (
                <div key={leave._id} className="rounded-2xl border border-gray-800 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{leave.teacherName}</p>
                      <p className="text-sm text-gray-400">{leave.department}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.includes(leave._id)}
                      onChange={() => toggleSelected(leave._id)}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <p>Type: {leave.leaveType}</p>
                    <p>Days: {leave.days}</p>
                    <p>From: {new Date(leave.from).toLocaleDateString()}</p>
                    <p>To: {new Date(leave.to).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={leave.status} />
                    <RiskBadges alerts={leave.riskAlerts || []} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs ${
        status === "approved"
          ? "bg-green-600/20 text-green-400"
          : status === "rejected"
          ? "bg-red-600/20 text-red-400"
          : "bg-yellow-600/20 text-yellow-400"
      }`}
    >
      {status}
    </span>
  );
}

function RiskBadges({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) {
    return <span className="text-xs text-gray-500">None</span>;
  }

  return (
    <span className="flex flex-wrap gap-1">
      {alerts.map((alert) => (
        <span
          key={alert}
          className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-300"
        >
          {alert}
        </span>
      ))}
    </span>
  );
}
