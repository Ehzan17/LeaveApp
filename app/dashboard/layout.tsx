"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

 useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  fetch("/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message === "Unauthorized") {
        router.push("/login");
        return;
      }

      setUser(data);

      // ✅ ROLE BASED AUTO REDIRECT
      if (pathname === "/dashboard" || pathname === "/dashboard/") {
  router.replace(`/dashboard/${data.role}`);
}
    })
    .catch(() => router.push("/login"))
    .finally(() => setLoading(false));
}, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-gray-200">

      {/* Sidebar */}
      <aside className="w-64 bg-[#0f0f0f] border-r border-gray-800 flex flex-col">

        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Staff Portal</h2>
          <p className="text-sm text-gray-400">St. Paul’s College</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 text-sm">

          {user?.role === "teacher" && (
<>
          <Link href="/dashboard/teacher" className="block px-3 py-2 rounded-md hover:bg-gray-800">
            Dashboard
          </Link>

             <Link href="/dashboard/teacher/leaves" className="block px-3 py-2 rounded-md hover:bg-gray-800">
      My Leaves
    </Link>
  </>
          )}

          {user?.role === "principal" && (
            <>
             <Link href="/dashboard/principal" className="block px-3 py-2 rounded-md hover:bg-gray-800">
            Dashboard
          </Link>
              <Link href="/dashboard/principal/approvals" className="block px-3 py-2 rounded-md hover:bg-gray-800">
                Approve Leaves
              </Link>

              <Link href="/dashboard/teachers" className="block px-3 py-2 rounded-md hover:bg-gray-800">
                Teachers
              </Link>
            </>
          )}

         {user?.role === "admin" && (
  <>
    <Link href="/dashboard/admin" className="block px-3 py-2 rounded-md hover:bg-gray-800">
      Dashboard
    </Link>

    <Link href="/dashboard/admin/users" className="block px-3 py-2 rounded-md hover:bg-gray-800">
      Manage Users
    </Link>

    <Link href="/dashboard/admin/leaves" className="block px-3 py-2 rounded-md hover:bg-gray-800">
      All Leaves
    </Link>

    <Link href="/dashboard/admin/activity" className="block px-3 py-2 rounded-md hover:bg-gray-800">
      Activity Logs
    </Link>

    <Link href="/dashboard/admin/settings" className="block px-3 py-2 rounded-md hover:bg-gray-800">
      System Settings
    </Link>
  </>
)}

          <div className="group relative">
            <div className="px-3 py-2 rounded-md hover:bg-gray-800 cursor-pointer">
              Settings
            </div>

            <div className="absolute left-full top-0 ml-2 hidden group-hover:block bg-[#111] border border-gray-800 rounded-lg shadow-xl w-48">
              <Link href="/dashboard/settings/profile" className="block px-4 py-2 hover:bg-gray-800">
                Edit Profile
              </Link>
              <Link href="/dashboard/settings/password" className="block px-4 py-2 hover:bg-gray-800">
                Change Password
              </Link>
            </div>
          </div>

        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          © 2026 SPC
        </div>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-[#111]">

          <div>
            <h1 className="text-2xl font-semibold text-white">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user?.name}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{user?.name}</div>
              <div className="text-xs text-gray-400">
                {user?.department || "Department"}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-all"
            >
              Logout
            </button>
          </div>

        </header>

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 p-8 bg-[#0b0b0b]"
        >
          {children}
        </motion.main>

      </div>
    </div>
  );
}