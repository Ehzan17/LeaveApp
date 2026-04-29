"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

type Leave = {
  _id: string;
  from?: string;
  to?: string;
  reason?: string;
  status?: "pending" | "approved" | "rejected";
  leaveType?: string;
  session?: string;
  days?: number;
  createdAt?: string;
};

type Teacher = {
  _id: string;
  name: string;
  email: string;
  department?: string;
  phone?: string;
  photo?: string;
  designation?: string;
  qualification?: string;
  experience?: string | number;
  address?: string;
  bio?: string;
  active?: boolean;
  leaveBalance?: Record<string, number>;
  leaves?: Leave[];
  totalLeaves?: number;
  pendingLeaves?: number;
  approvedLeaves?: number;
  rejectedLeaves?: number;
};

const aidedDepartments = [
  "Physics",
  "Mathematics",
  "Chemistry",
  "Economics",
  "English",
  "Commerce",
];

const leaveTypes = ["CL", "OD", "DL", "VL", "CML"];

function formatDate(value?: string) {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status?: string) {
  if (status === "approved") return "bg-green-600/20 text-green-400";
  if (status === "rejected") return "bg-red-600/20 text-red-400";
  return "bg-yellow-600/20 text-yellow-400";
}

export default function PrincipalTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch("/api/principal/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Unable to load teachers");
          return;
        }

        const teacherList = data.teachers || [];
        setTeachers(teacherList);
        setSelectedTeacher(teacherList[0] || null);
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong while loading teachers");
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const departments = useMemo(() => {
    const unique = new Set(
      teachers.map((teacher) => teacher.department).filter(Boolean) as string[]
    );
    return ["All", ...Array.from(unique).sort()];
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesDepartment =
        department === "All" || teacher.department === department;

      const matchesSearch =
        !term ||
        [teacher.name, teacher.email, teacher.department, teacher.designation]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(term));

      return matchesDepartment && matchesSearch;
    });
  }, [department, search, teachers]);

  const totalPending = teachers.reduce(
    (sum, teacher) => sum + (teacher.pendingLeaves || 0),
    0
  );
  const aidedCount = teachers.filter((teacher) =>
    aidedDepartments.includes(teacher.department || "")
  ).length;
  const selfFinancingCount = teachers.length - aidedCount;

  if (loading) {
    return <div className="text-white">Loading teachers...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Teachers" value={teachers.length} tone="text-blue-400" />
        <StatCard label="Aided Dept" value={aidedCount} tone="text-green-400" />
        <StatCard
          label="Self Financing"
          value={selfFinancingCount}
          tone="text-purple-400"
        />
        <StatCard label="Pending Leaves" value={totalPending} tone="text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <section className="rounded-2xl border border-gray-800 bg-[#111]/80 p-5 shadow-xl backdrop-blur-md sm:p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Teacher Directory</h2>
              <p className="mt-1 text-sm text-gray-400">
                Search by name, email, department, or designation.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search teacher..."
                  className="w-full rounded-xl border border-gray-700 bg-[#0d0d0d] py-3 pl-10 pr-3 text-sm outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="rounded-xl border border-gray-700 bg-[#0d0d0d] p-3 text-sm outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-400">
              No teachers found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredTeachers.map((teacher) => (
                <button
                  key={teacher._id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`rounded-2xl border p-4 text-left transition hover:border-red-500 hover:bg-white/[0.03] ${
                    selectedTeacher?._id === teacher._id
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-800 bg-black/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={teacher.photo || "/avatar.png"}
                      alt={teacher.name}
                      className="h-16 w-16 rounded-full border-2 border-gray-700 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-white">
                            {teacher.name}
                          </h3>
                          <p className="truncate text-sm text-gray-400">
                            {teacher.department || "No department"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            teacher.active === false
                              ? "bg-red-600/20 text-red-400"
                              : "bg-green-600/20 text-green-400"
                          }`}
                        >
                          {teacher.active === false ? "Disabled" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid w-full grid-cols-1 gap-1 text-center text-xs">
                    <MiniMetric label="Total" value={teacher.totalLeaves || 0} />
                    <MiniMetric
                      label="Pending"
                      value={teacher.pendingLeaves || 0}
                    />
                    <MiniMetric
                      label="Approved"
                      value={teacher.approvedLeaves || 0}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <TeacherDetails teacher={selectedTeacher} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#111]/80 p-5 shadow-xl">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0d0d0d] px-2 py-2">
      <p className="font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-gray-500">{label}</p>
    </div>
  );
}

function TeacherDetails({ teacher }: { teacher: Teacher | null }) {
  if (!teacher) {
    return (
      <aside className="rounded-2xl border border-gray-800 bg-[#111]/80 p-6 shadow-xl">
        <p className="text-gray-400">Select a teacher to view details.</p>
      </aside>
    );
  }

  const sortedLeaves = [...(teacher.leaves || [])].sort(
    (a, b) =>
      new Date(b.createdAt || b.from || 0).getTime() -
      new Date(a.createdAt || a.from || 0).getTime()
  );

  return (
    <aside className="rounded-2xl border border-gray-800 bg-[#111]/80 p-5 shadow-xl backdrop-blur-md sm:p-6">
      <div className="flex items-start gap-4">
        <img
          src={teacher.photo || "/avatar.png"}
          alt={teacher.name}
          className="h-20 w-20 rounded-full border-2 border-red-500 object-cover"
        />
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold">{teacher.name}</h2>
          <p className="text-sm text-gray-400">{teacher.department || "N/A"}</p>
          <p className="mt-1 text-xs text-gray-500">
            {aidedDepartments.includes(teacher.department || "")
              ? "Aided Department"
              : "Self Financing Department"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <InfoRow icon={<Mail size={16} />} label="Email" value={teacher.email} />
        <InfoRow
          icon={<Phone size={16} />}
          label="Phone"
          value={teacher.phone || "N/A"}
        />
        <InfoRow
          icon={<BriefcaseBusiness size={16} />}
          label="Designation"
          value={teacher.designation || "Teacher"}
        />
        <InfoRow
          icon={<BookOpen size={16} />}
          label="Qualification"
          value={teacher.qualification || "N/A"}
        />
        <InfoRow
          icon={<UserRound size={16} />}
          label="Experience"
          value={teacher.experience ? `${teacher.experience} Years` : "N/A"}
        />
        <InfoRow
          icon={<MapPin size={16} />}
          label="Address"
          value={teacher.address || "N/A"}
        />
      </div>

      {teacher.bio && (
        <div className="mt-6 rounded-xl border border-gray-800 bg-black/20 p-4">
          <p className="text-xs text-gray-400">Bio</p>
          <p className="mt-2 text-sm leading-6 text-gray-200">{teacher.bio}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-3 font-semibold">Leave Balance</h3>
        <div className="grid grid-cols-5 gap-2">
          {leaveTypes.map((type) => (
            <div
              key={type}
              className="rounded-xl border border-gray-800 bg-[#0d0d0d] p-3 text-center"
            >
              <p className="text-xs text-gray-500">{type}</p>
              <p className="mt-1 font-semibold text-white">
                {teacher.leaveBalance?.[type] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-semibold">Leave History</h3>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
            {sortedLeaves.length} records
          </span>
        </div>

        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {sortedLeaves.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-5 text-center text-sm text-gray-400">
              No leave history yet.
            </div>
          ) : (
            sortedLeaves.map((leave) => (
              <div
                key={leave._id}
                className="rounded-xl border border-gray-800 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {leave.leaveType || "Leave"}{" "}
                      <span className="text-sm text-gray-400">
                        {leave.days ? `- ${leave.days} day(s)` : ""}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <CalendarDays size={14} />
                      {formatDate(leave.from)} to {formatDate(leave.to)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs ${statusClass(
                      leave.status
                    )}`}
                  >
                    {leave.status || "pending"}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-300">
                  {leave.reason || "No reason provided"}
                </p>
                {leave.session && (
                  <p className="mt-2 text-xs text-gray-500">
                    Session: {leave.session}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-800 bg-black/20 p-3">
      <div className="mt-0.5 text-gray-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="break-words text-gray-200">{value}</p>
      </div>
    </div>
  );
}
