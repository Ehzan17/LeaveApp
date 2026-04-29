"use client";

import { useEffect, useMemo, useState } from "react";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import { ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

const HISTORY_LIMIT = 7;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const roleStatusClass = (status: string) =>
  status === "approved"
    ? "bg-green-600/20 text-green-400"
    : "bg-red-600/20 text-red-400";

export default function SFCoordinatorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
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
      const leaveArray = Array.isArray(data) ? data : [];
      setAllLeaves(leaveArray);

      const filtered = leaveArray.filter((l: any) => {
        const course = l.courseType?.toLowerCase().replace("-", "_");
        const status = l.approvals?.sfCoordinator?.toLowerCase().trim();

        return course === "self_financing" && status === "pending";
      });

      setLeaves(filtered);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLeaves([]);
      setAllLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const historyLeaves = useMemo(
    () =>
      allLeaves.filter((leave) => {
        const course = leave.courseType?.toLowerCase().replace("-", "_");
        const sfStatus = leave.approvals?.sfCoordinator?.toLowerCase().trim();

        return (
          course === "self_financing" &&
          (sfStatus === "approved" || sfStatus === "rejected")
        );
      }),
    [allLeaves]
  );

  const visibleHistory = historyExpanded
    ? historyLeaves
    : historyLeaves.slice(0, HISTORY_LIMIT);

  const approveLeave = async (id: string) => {
    const token = sessionStorage.getItem("token");

    setPendingAction(id);
    try {
      const res = await fetch(`/api/leaves/${id}/sf-approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || "Failed to approve leave");
        return;
      }

      setLeaves((prev) => prev.filter((leave) => leave._id !== id));
      setAllLeaves((prev) =>
        prev.map((leave) =>
          leave._id === id
            ? {
                ...leave,
                approvals: { ...leave.approvals, sfCoordinator: "approved" },
              }
            : leave
        )
      );
      toast.success("Leave forwarded to Manager");
      fetchData();
    } finally {
      setPendingAction(null);
    }
  };

  const rejectLeave = async (id: string) => {
    const token = sessionStorage.getItem("token");

    setPendingAction(id);
    try {
      const res = await fetch(`/api/leaves/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || "Failed to reject leave");
        return;
      }

      setLeaves((prev) => prev.filter((leave) => leave._id !== id));
      setAllLeaves((prev) =>
        prev.map((leave) =>
          leave._id === id
            ? {
                ...leave,
                status: "rejected",
                approvals: { ...leave.approvals, sfCoordinator: "rejected" },
              }
            : leave
        )
      );
      toast.success("Leave rejected");
      fetchData();
    } finally {
      setPendingAction(null);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-6">
        <ProfilePhotoUploader
          currentPhoto={user?.photo}
          onUploadSuccess={(url) => setUser({ ...user, photo: url })}
        />

        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-400">SF Coordinator</p>
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">
          Self Financing Leave Requests
        </h2>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Days</th>
                <th className="p-3 text-left">Balance</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((leave) => {
                const isSubmitting = pendingAction === leave._id;

                return (
                <tr
                  key={leave._id}
                  className="border-b border-gray-800 hover:bg-[#1a1a1a]"
                >
                  <td className="p-3 font-medium">{leave.teacherName}</td>
                  <td className="p-3">{formatDate(leave.from)}</td>
                  <td className="p-3">{formatDate(leave.to)}</td>
                  <td className="p-3 text-blue-400 font-medium">
                    {leave.leaveType}
                  </td>
                  <td className="p-3">{leave.days}</td>
                  <td className="p-3 text-yellow-400">
                    {leave.leaveBalance?.[leave.leaveType] ?? "-"}
                  </td>
                  <td className="p-3">
                    <div>{leave.reason}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {leave.session}
                    </div>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => approveLeave(leave._id)}
                      disabled={isSubmitting}
                      className="bg-green-600 px-3 py-1 rounded text-xs hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "Working..." : "Approve"}
                    </button>
                    <button
                      onClick={() => rejectLeave(leave._id)}
                      disabled={isSubmitting}
                      className="bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">My Decisions</h2>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Days</th>
                <th className="p-3 text-left">Balance</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {visibleHistory.map((leave) => {
                const sfStatus =
                  leave.approvals?.sfCoordinator?.toLowerCase().trim() || "";

                return (
                  <tr
                    key={leave._id}
                    className="border-b border-gray-800 hover:bg-[#1a1a1a]"
                  >
                    <td className="p-3 font-medium">{leave.teacherName}</td>
                    <td className="p-3">{formatDate(leave.from)}</td>
                    <td className="p-3">{formatDate(leave.to)}</td>
                    <td className="p-3 text-blue-400 font-medium">
                      {leave.leaveType}
                    </td>
                    <td className="p-3">{leave.days}</td>
                    <td className="p-3 text-yellow-400">
                      {leave.leaveBalance?.[leave.leaveType] ?? "-"}
                    </td>
                    <td className="p-3">
                      <div>{leave.reason}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {leave.session}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${roleStatusClass(
                          sfStatus
                        )}`}
                      >
                        {sfStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {historyLeaves.length > HISTORY_LIMIT && (
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setHistoryExpanded((value) => !value)}
              className="inline-flex items-center gap-2 rounded bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700"
            >
              {historyExpanded ? "Show less" : "Show all"}
              {historyExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
