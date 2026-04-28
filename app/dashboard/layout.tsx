"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const navClass =
    "block rounded-xl px-3 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white";

  const fetchNotifications = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      if (data.unreadCount > 0) {
        toast(`${data.unreadCount} unread notification(s)`);
      }
    }
  };

  const markNotificationsRead = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setShowNotifications((value) => !value);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUnreadCount(0);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.message === "Unauthorized" || data.message === "Invalid token") {
          router.push("/login");
          return;
        }

        setUser(data);
        fetchNotifications();

        if (pathname === "/dashboard" || pathname === "/dashboard/") {
          router.replace(`/dashboard/${data.role}`);
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050506] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top_left,#172033_0,#090b10_42%,#050506_100%)] text-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky md:top-0 z-50 h-full md:h-screen w-72 md:w-64
        bg-[#080b12]/90 backdrop-blur-2xl border-r border-white/10 flex flex-col
        shadow-2xl shadow-black/30 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Staff Portal</h2>
            <p className="text-sm text-gray-400">St. Paul's College</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {user?.role === "teacher" && (
            <>
              <Link href="/dashboard/teacher" className={navClass}>
                Dashboard
              </Link>
              <Link href="/dashboard/teacher/leaves" className={navClass}>
                My Leaves
              </Link>
            </>
          )}

          {user?.role === "manager" && (
            <Link href="/dashboard/manager" className={navClass}>
              Dashboard
            </Link>
          )}

          {user?.role === "sf_coordinator" && (
            <Link href="/dashboard/sf-coordinator" className={navClass}>
              Dashboard
            </Link>
          )}

          {user?.role === "principal" && (
            <>
              <Link href="/dashboard/principal" className={navClass}>
                Dashboard
              </Link>
              <Link href="/dashboard/principal/approvals" className={navClass}>
                Approve Leaves
              </Link>
              <Link href="/dashboard/teachers" className={navClass}>
                Teachers
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link href="/dashboard/admin" className={navClass}>
                Dashboard
              </Link>
              <Link href="/dashboard/admin/users" className={navClass}>
                Manage Users
              </Link>
              <Link href="/dashboard/admin/leaves" className={navClass}>
                All Leaves
              </Link>
              <Link href="/dashboard/admin/activity" className={navClass}>
                Activity Logs
              </Link>
              <Link href="/dashboard/admin/settings" className={navClass}>
                System Settings
              </Link>
            </>
          )}

          <div className="relative">
            <button
              onClick={() => setShowSettings((prev) => !prev)}
              className="w-full rounded-xl px-3 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              Settings
            </button>

            {showSettings && (
              <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Link
                  href="/dashboard/settings/profile"
                  className="block px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setShowSettings(false)}
                >
                  Edit Profile
                </Link>
                <Link
                  href="/dashboard/settings/password"
                  className="block px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setShowSettings(false)}
                >
                  Change Password
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4 text-xs text-gray-500">
          © 2026 SPC
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-white/10 bg-[#0b0f19]/75 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/stpaulslogo.png"
              className="h-9 w-9 object-contain sm:h-10 sm:w-10"
              alt="St. Paul's College"
            />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">
                Staff Dashboard
              </h1>
              <p className="truncate text-xs text-gray-400">
                Leave Management System
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            <button
              onClick={markNotificationsRead}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0b0f19] p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="h-8 min-h-8 rounded-lg px-2 text-xs text-gray-400 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-400">No notifications yet.</p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="min-h-11 rounded-xl bg-red-600 px-4 py-2 text-sm shadow-lg shadow-red-950/20 transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-content w-full flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
