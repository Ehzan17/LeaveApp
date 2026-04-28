"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const departments = [
  "Physics",
  "Mathematics",
  "Chemistry",
  "Economics",
  "English",
  "Commerce",
  "Computer Science",
  "Business Administration",
  "Banking and Financial Services",
  "Tourism and Hospitality Management",
  "Logistics Management",
  "Broadcasting and Journalism"
];

const leaveTypes = ["CL", "VL", "OD", "DL", "CML"];

export default function AdminUsersPage() {
const [showAcademic, setShowAcademic] = useState(true);
const [showAided, setShowAided] = useState(true);
const [showSF, setShowSF] = useState(true);
const [showAdminStaff, setShowAdminStaff] = useState(false);
  const [dept, setDept] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",
    department: departments[0]
  });

    const getToken = () => sessionStorage.getItem("token");

const loadUsers = async () => {

  let url = "";

  const adminRoles = ["admin", "principal", "manager", "sf_coordinator"];

  if (adminRoles.includes(dept)) {
    url = `/api/admin/users/by-role?role=${dept}`;
  } else {
    url = `/api/admin/users/by-department?department=${dept}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();

  setUsers(data.users || []);
};

  useEffect(() => {
    loadUsers();
  }, [dept]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateSelectedUser = async () => {
    if (!selectedUser) return;

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        userId: selectedUser._id,
        updates: selectedUser,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Unable to update user");
      return;
    }

    toast.success(data.message || "User updated");
    loadUsers();
  };

  return (
    <div className="flex flex-col md:flex-row h-full">

      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-800 bg-[#0b0f19] p-4 text-sm overflow-x-auto">

  {/* Academic Departments */}

  <button
    onClick={() => setShowAcademic(!showAcademic)}
    className="flex items-center justify-between w-full font-semibold text-gray-200 hover:text-white mb-2"
  >
    <span className="flex items-center gap-2">
      Academic Departments
    </span>
    <span className="text-xs">{showAcademic ? "▼" : "▶"}</span>
  </button>

  {showAcademic && (
    <div className="ml-2 border-l border-gray-800 pl-3 space-y-1">

      {/* Aided Courses */}

      <button
        onClick={() => setShowAided(!showAided)}
        className="flex items-center justify-between w-full text-gray-400 hover:text-white"
      >
        <span>Aided Courses</span>
        <span className="text-xs">{showAided ? "▼" : "▶"}</span>
      </button>

      {showAided && (
        <div className="ml-2 space-y-1">

          {[
            "Physics",
            "Mathematics",
            "Chemistry",
            "Economics",
            "English",
            "Commerce"
          ].map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                dept === d
                  ? "bg-yellow-500 text-black"
                  : "hover:bg-[#111827] text-gray-400 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}

        </div>
      )}

      {/* Self Financing */}

      <button
        onClick={() => setShowSF(!showSF)}
        className="flex items-center justify-between w-full text-gray-400 hover:text-white mt-2"
      >
        <span>Self Financing</span>
        <span className="text-xs">{showSF ? "▼" : "▶"}</span>
      </button>

      {showSF && (
        <div className="ml-2 space-y-1">

          {[
            "Computer Science",
            "Business Administration",
            "Banking and Financial Services",
            "Tourism and Hospitality Management",
            "Logistics Management",
            "Broadcasting and Journalism"
          ].map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                dept === d
                  ? "bg-yellow-500 text-black"
                  : "hover:bg-[#111827] text-gray-400 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}

        </div>
      )}

    </div>
  )}

  {/* Administrative Staff */}

  <button
    onClick={() => setShowAdminStaff(!showAdminStaff)}
    className="flex items-center justify-between w-full font-semibold text-gray-200 hover:text-white mt-6"
  >
    <span className="flex items-center gap-2">
      Administrative Staff
    </span>
    <span className="text-xs">{showAdminStaff ? "▼" : "▶"}</span>
  </button>

  {showAdminStaff && (
    <div className="ml-2 border-l border-gray-800 pl-3 space-y-1">

      {["admin", "principal", "manager", "sf_coordinator"].map((role) => (
        <button
          key={role}
          onClick={() => setDept(role)}
          className={`block w-full text-left px-3 py-2 rounded-lg transition ${
            dept === role
              ? "bg-yellow-500 text-black"
              : "hover:bg-[#111827] text-gray-400 hover:text-white"
          }`}
        >
          {role.replace("_", " ").toUpperCase()}
        </button>
      ))}

    </div>
  )}

</div>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">

        <h2 className="text-2xl font-bold">
          {dept} Department
        </h2>

        <input
          placeholder="Search teacher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-gray-800 p-3 rounded"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {filtered.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className="bg-[#111] border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-yellow-500 transition"
            >
              <img
                src={user.photo || "/avatar.png"}
                className="w-16 h-16 rounded-full object-cover mb-3"
              />

              <p className="font-semibold">{user.name}</p>

              <p className="text-sm text-gray-400">
                {user.email}
              </p>

              <p className="text-xs text-gray-500">
                {user.designation || "Teacher"}
              </p>
            </div>
          ))}

          <div className="flex items-center justify-center bg-[#111] border border-gray-800 rounded-xl">

            <button
              onClick={() => setShowCreate(true)}
              className="text-4xl text-gray-400 hover:text-white"
            >
              +
            </button>

          </div>

        </div>
      </div>

      {selectedUser && (
        <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-[#111] border-l border-gray-800 p-6 space-y-4 overflow-y-auto">

          <button
            onClick={() => setSelectedUser(null)}
            className="text-sm text-gray-400"
          >
            Close
          </button>

          <img
            src={selectedUser.photo || "/avatar.png"}
            className="w-24 h-24 rounded-full object-cover"
          />

          <h3 className="text-xl font-bold">
            {selectedUser.name}
          </h3>

          <p className="text-gray-400">
            {selectedUser.email}
          </p>

          <div className="space-y-3 rounded-2xl border border-gray-800 bg-black/20 p-4">
            <h4 className="font-semibold">Edit Details</h4>
            {[
              ["name", "Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["designation", "Designation"],
              ["qualification", "Qualification"],
              ["experience", "Experience"],
              ["address", "Address"],
            ].map(([field, label]) => (
              <label key={field} className="block">
                <span className="text-xs text-gray-400">{label}</span>
                <input
                  value={selectedUser[field] || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      [field]: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-800 bg-black/40 p-3"
                />
              </label>
            ))}

            <label className="block">
              <span className="text-xs text-gray-400">Bio</span>
              <textarea
                value={selectedUser.bio || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, bio: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-gray-800 bg-black/40 p-3"
              />
            </label>

            <div>
              <p className="mb-2 text-xs text-gray-400">Leave Balance</p>
              <div className="grid grid-cols-2 gap-2">
                {leaveTypes.map((type) => (
                  <label key={type} className="block">
                    <span className="text-xs text-gray-500">{type}</span>
                    <input
                      type="number"
                      value={selectedUser.leaveBalance?.[type] ?? 0}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          leaveBalance: {
                            ...(selectedUser.leaveBalance || {}),
                            [type]: Number(e.target.value),
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-gray-800 bg-black/40 p-3"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={updateSelectedUser}
              className="w-full rounded-xl bg-green-600 p-3 hover:bg-green-500"
            >
              Save User Changes
            </button>
          </div>

          <p>
            <b>Phone:</b>{" "}
            {selectedUser.phone || "N/A"}
          </p>

          <p>
            <b>Qualification:</b>{" "}
            {selectedUser.qualification || "N/A"}
          </p>

          <p>
            <b>Experience:</b>{" "}
            {selectedUser.experience || "N/A"}
          </p>

          <div className="space-y-1">

            <p className="text-sm text-gray-400">
              Role
            </p>

            <select
              value={selectedUser.role}
              onChange={async (e) => {
                setSelectedUser({ ...selectedUser, role: e.target.value });
                await fetch("/api/admin/users/change-role", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                  },
                  body: JSON.stringify({
                    userId: selectedUser._id,
                    role: e.target.value
                  })
                });

                loadUsers();
              }}
              className="w-full bg-[#111] border border-gray-800 p-2 rounded"
            >
             <option value="teacher">Teacher</option>
<option value="principal">Principal</option>
<option value="sf_coordinator">SF Coordinator</option>
<option value="manager">Manager</option>
<option value="admin">Admin</option>
            </select>

          </div>

          <button
            onClick={async () => {
              if (!newPassword) {
                toast.error("Enter a new password");
                return;
              }

              await fetch("/api/admin/users/reset-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                  userId: selectedUser._id,
                  newPassword
                })
              });

              toast.success("Password reset successfully");
              setNewPassword("");

            }}
            className="w-full bg-purple-600 p-2 rounded"
          >
            Reset Password
          </button>

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-black/40 p-3"
          />

<button
  onClick={async () => {

    const res = await fetch("/api/admin/users/disable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        userId: selectedUser._id
      })
    });

    const data = await res.json();

    setSelectedUser({
      ...selectedUser,
      active: data.active
    });

    loadUsers();

  }}
  className={`w-full p-2 rounded cursor-pointer transition ${
    selectedUser.active
      ? "bg-red-600 hover:bg-red-500"
      : "bg-green-600 hover:bg-green-500"
  }`}
>
  {selectedUser.active ? "Disable User" : "Enable User"}
</button>

        </div>
      )}
{showCreate && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-[#111] border border-gray-800 p-6 sm:p-8 rounded-xl w-[90%] sm:w-[420px] space-y-4">

      <h3 className="text-xl font-bold">Create New User</h3>

      <input
        placeholder="Full Name"
        className="w-full p-2 bg-black border border-gray-700 rounded"
        value={newUser.name}
        onChange={(e) =>
          setNewUser({ ...newUser, name: e.target.value })
        }
      />

      <input
        placeholder="Email"
        className="w-full p-2 bg-black border border-gray-700 rounded"
        value={newUser.email}
        onChange={(e) =>
          setNewUser({ ...newUser, email: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 bg-black border border-gray-700 rounded"
        value={newUser.password}
        onChange={(e) =>
          setNewUser({ ...newUser, password: e.target.value })
        }
      />

     <select
  className="w-full p-2 bg-black border border-gray-700 rounded"
  value={newUser.role}
  onChange={(e) =>
    setNewUser({
      ...newUser,
      role: e.target.value,
      department: e.target.value === "teacher" ? dept : ""
    })
  }
>
  <option value="teacher">Teacher</option>
  <option value="principal">Principal</option>
  <option value="sf_coordinator">SF Coordinator</option>
  <option value="manager">Manager</option>
  <option value="admin">Admin</option>
</select>

      {newUser.role === "teacher" && (
  <select
    className="w-full p-2 bg-black border border-gray-700 rounded"
    value={newUser.department}
    onChange={(e) =>
      setNewUser({ ...newUser, department: e.target.value })
    }
  >
    {departments.map((d) => (
      <option key={d}>{d}</option>
    ))}
  </select>
)}

      <div className="flex gap-3 pt-3">

        <button
          onClick={() => setShowCreate(false)}
          className="flex-1 bg-gray-700 p-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={async () => {

            const res = await fetch("/api/admin/users/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
              },
              body: JSON.stringify(newUser)
            });

            const data = await res.json();

            if (!res.ok) {
              toast.error(data.message || "Unable to create user");
              return;
            }

            toast.success(data.message || "User created");

            if (res.ok) {

              setShowCreate(false);

              setNewUser({
                name: "",
                email: "",
                password: "",
                role: "teacher",
                department: dept
              });

              loadUsers();
            }

          }}
          className="flex-1 bg-green-600 hover:bg-green-500 p-2 rounded"
        >
          Create
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}
