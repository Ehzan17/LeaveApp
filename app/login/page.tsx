"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
if (data.role === "admin") {
  router.push("/dashboard/admin");

} else if (data.role === "principal") {
  router.push("/dashboard/principal");

} else if (data.role === "sf_coordinator") {
  router.push("/dashboard/sf-coordinator");

} else if (data.role === "manager") {
  router.push("/dashboard/manager");

} else {
  router.push("/dashboard/teacher");
}

    } catch (error) {
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-red-600/20 rounded-full blur-3xl -top-40 -left-40"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl bottom-0 right-0"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-gray-800 p-10 rounded-2xl shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-2">
          Staff Portal
        </h1>

        <p className="text-gray-400 text-center mb-8 text-sm">
          Secure Role-Based Access System
        </p>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email */}
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full mt-2 px-4 py-3 bg-[#0b0f19] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-400">Password</label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[#0b0f19] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-700 hover:bg-red-800 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          © 2026 St. Paul’s College — Enterprise Leave Management System
        </p>

      </div>
    </div>
  );
}