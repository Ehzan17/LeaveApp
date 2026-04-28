"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ProfilePhotoUploader({
  currentPhoto,
  onUploadSuccess,
}: {
  currentPhoto?: string;
  onUploadSuccess: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const uploadImage = async () => {
    if (!preview) return;

    try {
      setUploading(true);

      const token = sessionStorage.getItem("token");

      const resBlob = await fetch(preview);
      const blob = await resBlob.blob();

      const formData = new FormData();
      formData.append("file", blob);

      const res = await fetch("/api/upload-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        toast.error("Upload failed ❌");
        return;
      }

      const imageUrl = data?.photo || data?.url;

      if (imageUrl) {
        onUploadSuccess(imageUrl);
        toast.success("Photo updated 📸");
        setPreview(null);
      }

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ⚠️");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">

      {/* 🔥 Preview Circle */}
      <motion.div
        className="w-28 h-28 rounded-full overflow-hidden border-2 border-red-500 shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <img
          src={preview || currentPhoto || "/avatar.png"}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* 🔥 Dropzone */}
      {!preview && (
        <div
          {...getRootProps()}
          className={`w-full max-w-xs text-center border-2 border-dashed p-4 rounded-xl cursor-pointer transition-all
          ${
            isDragActive
              ? "border-red-500 bg-red-500/10"
              : "border-gray-600 hover:border-red-500"
          }`}
        >
          <input {...getInputProps()} />

          <p className="text-sm text-gray-400">
            {isDragActive
              ? "Drop image here 📥"
              : "Click or drag to upload"}
          </p>
        </div>
      )}

      {/* 🔥 Action Buttons */}
      {preview && (
        <div className="flex gap-3 w-full max-w-xs">

          <button
            onClick={() => setPreview(null)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>

          <button
            onClick={uploadImage}
            disabled={uploading}
            className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Save Photo"}
          </button>

        </div>
      )}
    </div>
  );
}