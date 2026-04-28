"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-gray-900 text-white flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <img
        src="/stpaulslogo.png"
        className="w-20 sm:w-24 mb-6"
      />

      {/* Title */}
      <h1 className="text-3xl sm:text-5xl font-bold text-center leading-tight">
        Teacher Leave <span className="text-red-500">Management</span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-center mt-4 max-w-md text-sm sm:text-base">
        Smart leave tracking system for aided and self-financing departments
      </p>

      {/* Button */}
      <button
        onClick={() => router.push("/login")}
        className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
      >
        Access Portal →
      </button>

      {/* Footer */}
      <p className="absolute bottom-4 text-xs text-gray-500">
        © {new Date().getFullYear()} St. Paul’s College
      </p>

    </div>
  );
}