"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed ❌");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("token", data.token);

      const decoded = JSON.parse(atob(data.token.split(".")[1]));
      const role = decoded.role;

      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "principal") {
        router.push("/dashboard/principal");
      } else if (role === "sf_coordinator") {
        router.push("/dashboard/sf-coordinator");
      } else if (role === "manager") {
        router.push("/dashboard/manager");
      } else {
        router.push("/dashboard/teacher");
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error("Something went wrong ⚠️");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-gray-900 flex items-center justify-center px-4">

      {/* Card */}
      <div className="w-full max-w-md bg-[#111]/80 backdrop-blur-md border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src="/stpaulslogo.png" className="w-16 mb-3" />
          <h1 className="text-2xl font-semibold">Staff Portal</h1>
          <p className="text-gray-400 text-sm mt-1 text-center">
            Secure Role-Based Access System
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full mt-2 px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-gray-400">Password</label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 St. Paul’s College
        </p>

      </div>
    </div>
  );
}