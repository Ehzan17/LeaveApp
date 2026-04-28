"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setForm(data);
      });
  }, []);

  const handleUpdate = async () => {
    const token = sessionStorage.getItem("token");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Update failed ");
      return;
    }

    toast.success("Profile updated successfully");
    router.push(`/dashboard/${user.role}`);
  };

  if (!user) return null;

 const Row = ({ label, field, last }: any) => (
    <div className="flex justify-between items-center px-4 py-4 border-b border-white/5 hover:bg-white/5 transition-all">
      <span className="text-gray-400 text-sm">{label}</span>

      {editing === field ? (
        <input
          autoFocus
          value={form[field] || ""}
          onChange={(e) =>
            setForm({ ...form, [field]: e.target.value })
          }
          onBlur={() => setEditing(null)}
          className="bg-black border border-gray-700 px-2 py-1 rounded text-right"
        />
      ) : (
        <div
          onClick={() => setEditing(field)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-white text-sm">
            {form[field] || "-"}
          </span>
          <span className="text-gray-500">›</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6 px-2 sm:px-0">

      <h2 className="text-xl font-semibold px-2">
  Edit Profile
</h2>

{/* 🔥 PROFILE PHOTO */}
<ProfilePhotoUploader
  currentPhoto={form.photo}
  onUploadSuccess={(url: string) => {
    setForm({ ...form, photo: url });
    toast.success("Photo updated 📸");
  }}
/> 
    {/* iOS Card */}
      <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">

        <Row label="Full Name" field="name" />
        <Row label="Department" field="department" />
        <Row label="Phone" field="phone" />
        <Row label="Designation" field="designation" />
        <Row label="Qualification" field="qualification" />
        <Row label="Experience" field="experience" />

      </div>

      {/* Bio Section */}
      <div className="bg-[#111]/80 backdrop-blur-md rounded-2xl border border-gray-800 p-4 space-y-3">

        <label className="text-sm text-gray-400">Address</label>
        <textarea
          value={form.address || ""}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
          className="w-full bg-black border border-gray-700 p-3 rounded-lg"
        />

        <label className="text-sm text-gray-400">Bio</label>
        <textarea
          value={form.bio || ""}
          onChange={(e) =>
            setForm({ ...form, bio: e.target.value })
          }
          className="w-full bg-black border border-gray-700 p-3 rounded-lg"
        />

      </div>

      {/* Save Button */}
      <button
        onClick={handleUpdate}
        className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white"
      >
        Save Changes
      </button>

    </div>
  );
}