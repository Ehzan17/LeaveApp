"use client";

import { useEffect, useState } from "react";

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

export default function AdminUsersPage() {
const [showAcademic, setShowAcademic] = useState(true);
const [showAided, setShowAided] = useState(true);
const [showSF, setShowSF] = useState(true);
const [showAdminStaff, setShowAdminStaff] = useState(false);
  const [dept, setDept] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [showCreate, setShowCreate] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",
    department: departments[0]
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

const loadUsers = async () => {

  let url = "";

  const adminRoles = ["admin", "principal", "manager", "sf_coordinator"];

  if (adminRoles.includes(dept)) {
    url = `/api/admin/users/by-role?role=${dept}`;
  } else {
    url = `/api/admin/users/by-department?department=${dept}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
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

  return (
    <div className="flex h-full">

      <div className="w-64 border-r border-gray-800 bg-[#0b0f19] p-4 text-sm">

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
      <div className="flex-1 p-8 space-y-6">

        <h2 className="text-2xl font-bold">
          {dept} Department
        </h2>

        <input
          placeholder="Search teacher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-gray-800 p-3 rounded"
        />

        <div className="grid grid-cols-4 gap-6">

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
        <div className="fixed right-0 top-0 h-full w-96 bg-[#111] border-l border-gray-800 p-6 space-y-4 overflow-y-auto">

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
              defaultValue={selectedUser.role}
              onChange={async (e) => {
                await fetch("/api/admin/users/change-role", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
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

              const newPass = prompt("Enter new password");

              if (!newPass) return;

              await fetch("/api/admin/users/reset-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  userId: selectedUser._id,
                  newPassword: newPass
                })
              });

              alert("Password reset successful");

            }}
            className="w-full bg-purple-600 p-2 rounded"
          >
            Reset Password
          </button>

<button
  onClick={async () => {

    const res = await fetch("/api/admin/users/disable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
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

    <div className="bg-[#111] border border-gray-800 p-8 rounded-xl w-[420px] space-y-4">

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
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(newUser)
            });

            const data = await res.json();

            alert(data.message);

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