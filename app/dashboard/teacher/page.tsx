"use client";

import { useEffect, useState } from "react";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
const [form, setForm] = useState({
  from: null as Date | null,
  to: null as Date | null,
  reason: "",
  leaveType: "CL",
  session: "full_day",
});
  const fetchData = async () => {
    
    const token = sessionStorage.getItem("token");
if (!token) {
  console.log("No token found");
  return;
}
    const userRes = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await userRes.json();
    setUser(userData);

    const leaveRes = await fetch("/api/leaves", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const leaveData = await leaveRes.json();
    setLeaves(leaveData);
  };

  useEffect(() => {
    fetchData();
  }, []);
const handleSubmit = async () => {
  const token = sessionStorage.getItem("token");

  if (!form.from || !form.to) {
    toast.error("Please select dates 📅");
    return;
  }

  try {
    setSubmitting(true);

    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        from: form.from?.toISOString(),
        to: form.to?.toISOString(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to apply leave ❌");
      setSubmitting(false);
      return;
    }

    toast.success("Leave applied successfully ✅");

    setForm({
      from: null,
      to: null,
      reason: "",
      leaveType: "CL",
      session: "full_day",
    });

    fetchData();

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong ⚠️");
  } finally {
    setSubmitting(false);
  }
};  return (
    <div className="space-y-8">

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Profile */}
        <div className="bg-[#111]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6">My Profile</h2>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6">

           <div className="w-full sm:w-64 shrink-0 space-y-4">

  {/* Profile Image */}
  <img
    src={user?.photo || "/avatar.png"}
    className="w-24 h-24 rounded-full object-cover border-2 border-red-500"
  />

  {/* Leave Summary */}
 <div className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl p-4 text-sm space-y-3">

  <p className="text-gray-400">Leave Summary</p>

  {/* Approved / Rejected */}
  <div className="flex justify-between text-sm">
    <p>
      Approved:{" "}
      <span className="text-green-400 font-semibold">
        {leaves.filter((l) => l.status === "approved").length}
      </span>
    </p>

    <p>
      Rejected:{" "}
      <span className="text-red-400 font-semibold">
        {leaves.filter((l) => l.status === "rejected").length}
      </span>
    </p>
  </div>

  {/* Leave Balance */}
  <div className="pt-2 border-t border-gray-700">
    <p className="text-gray-400 mb-2">Balance</p>

    <div className="flex flex-wrap gap-2 text-xs">

      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
        CL: {user?.leaveBalance?.CL ?? 0}
      </span>

      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded">
        OD: {user?.leaveBalance?.OD ?? 0}
      </span>

      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded">
        DL: {user?.leaveBalance?.DL ?? 0}
      </span>

      <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded">
        VL: {user?.leaveBalance?.VL ?? 0}
      </span>

      <span className="px-2 py-1 bg-pink-600/20 text-pink-400 rounded">
        CML: {user?.leaveBalance?.CML ?? 0}
      </span>

    </div>
  </div>

</div>
</div>

<div className="w-full min-w-0 space-y-2 text-sm break-words">
  <p><span className="text-gray-400">Name:</span> {user?.name}</p>
  <p><span className="text-gray-400">Email:</span> {user?.email}</p>
  <p><span className="text-gray-400">Department:</span> {user?.department}</p>
  <p><span className="text-gray-400">Designation:</span> {user?.designation || "—"}</p>
  <p><span className="text-gray-400">Qualification:</span> {user?.qualification || "—"}</p>
  <p><span className="text-gray-400">Experience:</span> {user?.experience ? `${user.experience} Years` : "—"}</p>
  <p><span className="text-gray-400">Phone:</span> {user?.phone}</p>
  <p><span className="text-gray-400">Address:</span> {user?.address || "—"}</p>
  <p><span className="text-gray-400">Bio:</span> {user?.bio || "—"}</p>
</div>

          </div>
        </div>

        {/* Apply Leave */}
        <div className="bg-[#111]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6">Apply Leave</h2>

<div className="space-y-5">

  {/* Leave Type */}
  <div>
    <label className="text-xs text-gray-400 mb-1 block">Leave Type</label>
    <select
  value={form.leaveType}
  onChange={(e) =>
    setForm({ ...form, leaveType: e.target.value })
  }
  className="w-full bg-[#0d0d0d] border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 p-3 rounded-xl transition"
>
  <option value="CL">Casual Leave (CL)</option>
  <option value="OD">On Duty (OD)</option>
  <option value="DL">Duty Leave (DL)</option>
  <option value="VL">Vacation Leave (VL)</option>   {/* ✅ ADDED */}
  <option value="CML">Medical Leave (CML)</option> {/* ✅ ADDED */}
</select>
  </div>

  {/* Session */}
  <div>
    <label className="text-xs text-gray-400 mb-1 block">Session</label>
    <select
      value={form.session}
     onChange={(e) => {
  const value = e.target.value;

  let updatedForm = { ...form, session: value };

  if (value !== "full_day" && form.from) {
    updatedForm.to = form.from;
  }

  setForm(updatedForm);
}}
      className="w-full bg-[#0d0d0d] border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 p-3 rounded-xl transition"
    >
    <option value="full_day">Full Day</option>
<option value="FN">Forenoon (FN)</option>
<option value="AN">Afternoon (AN)</option>
    </select>
  </div>

  {/* Dates */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

    <div>
      <label className="text-xs text-gray-400 mb-1 block">From Date</label>
     <DatePicker
  selected={form.from}
  onChange={(date: Date | null) => {
    let updatedForm = { ...form, from: date };

    if (form.session !== "full_day") {
      updatedForm.to = date;
    }

    setForm(updatedForm);
  }}
  dateFormat="dd MMM yyyy"
  placeholderText="Select date"
  className="w-full bg-[#0d0d0d] border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 p-3 rounded-xl"
  popperClassName="z-50"
/>    </div>

    <div>
      <label className="text-xs text-gray-400 mb-1 block">To Date</label>
      <DatePicker
        selected={form.to}
        onChange={(date: Date | null) =>
          setForm({ ...form, to: date })
        }
        dateFormat="dd MMM yyyy"
        placeholderText="Select date"
        className="w-full bg-[#0d0d0d] border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 p-3 rounded-xl"
        popperClassName="z-50"
      />
    </div>

  </div>

  {/* Reason */}
  <div>
    <label className="text-xs text-gray-400 mb-1 block">Reason</label>
    <textarea
      placeholder="Enter reason..."
      value={form.reason}
      onChange={(e) =>
        setForm({ ...form, reason: e.target.value })
      }
      className="w-full bg-[#0d0d0d] border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 p-3 rounded-xl min-h-[100px] resize-none"
    />
  </div>

  {/* Submit */}
  <button
  onClick={handleSubmit}
  disabled={submitting}
  className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
>
  {submitting ? "Submitting..." : "Submit Leave"}
</button>
</div>  
</div>

      </div>
      {/* Leave History */}
      <div className="bg-[#111]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-6">Leave History</h2>

        <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr
                key={leave._id}
                className="border-b border-gray-800 hover:bg-[#1a1a1a]"
              >
                <td className="p-3">
  {new Date(leave.from).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>

<td className="p-3">
  {new Date(leave.to).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>
                <td className="p-3">{leave.reason}</td>
                <td className="p-3">

  {/* Final Status */}
  <div>
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
  </div>

  {/* Approval Timeline */}
  {leave.courseType === "self_financing" && leave.approvals && (
    <div className="text-xs text-gray-400 mt-2 space-y-1">

      <div>
        SF Coordinator: {leave.approvals.sfCoordinator}
      </div>

      <div>
        Manager: {leave.approvals.manager}
      </div>

    </div>
  )}

</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Leave Timeline</h3>
          {leaves.map((leave) => (
            <div
              key={`${leave._id}-timeline`}
              className="rounded-2xl border border-gray-800 bg-black/20 p-4"
            >
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium">{leave.reason}</p>
                <p className="text-sm text-gray-400">
                  {new Date(leave.from).toLocaleDateString("en-GB")} -{" "}
                  {new Date(leave.to).toLocaleDateString("en-GB")}
                </p>
              </div>
              <LeaveTimeline leave={leave} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function LeaveTimeline({ leave }: { leave: any }) {
  const steps =
    leave.courseType === "self_financing"
      ? [
          { label: "Applied", status: "approved" },
          { label: "SF", status: leave.approvals?.sfCoordinator || "pending" },
          { label: "Manager", status: leave.approvals?.manager || "pending" },
          { label: "Principal", status: leave.approvals?.principal || leave.status },
        ]
      : [
          { label: "Applied", status: "approved" },
          { label: "Principal", status: leave.approvals?.principal || leave.status },
        ];

  return (
    <div className="relative grid gap-4 sm:grid-cols-4">
      {steps.map((step, index) => (
        <div key={`${step.label}-${index}`} className="relative flex gap-3 sm:block">
          <div
            className={`h-4 w-4 shrink-0 rounded-full sm:mx-auto ${timelineColor(
              step.status
            )}`}
          />
          <div className="sm:mt-3 sm:text-center">
            <p className="text-sm font-medium">{step.label}</p>
            <p
              className={`text-xs ${
                step.status === "approved"
                  ? "text-green-400"
                  : step.status === "rejected"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {step.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function timelineColor(status: string) {
  if (status === "approved") return "bg-green-500";
  if (status === "rejected") return "bg-red-500";
  return "bg-yellow-400";
}
