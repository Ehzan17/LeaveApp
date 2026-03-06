"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";

export default function ProfilePhotoUploader({
  currentPhoto,
  onUploadSuccess,
}: {
  currentPhoto?: string;
  onUploadSuccess: (url: string) => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const uploadImage = async () => {
    if (!imageSrc) return;

    const token = localStorage.getItem("token");

    const response = await fetch(imageSrc);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", blob);

   const res = await fetch("/api/upload-photo", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

if (!res.ok) {
  console.error("Upload failed");
  return;
}

const text = await res.text();
const data = text ? JSON.parse(text) : null;

if (data?.photo) {
  onUploadSuccess(data.photo);
  setImageSrc(null);
}

    };

  return (
    <div className="space-y-4">

      <div className="w-32 h-32 mx-auto relative">

        {currentPhoto ? (
          <img
            src={currentPhoto}
            className="w-32 h-32 rounded-full object-cover border-2 border-red-600"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-700" />
        )}

      </div>

      {!imageSrc && (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-600 p-6 text-center rounded-lg cursor-pointer hover:border-red-500"
        >
          <input {...getInputProps()} />
          <p className="text-gray-400">
            Drag & Drop image here or click to select
          </p>
        </div>
      )}

      {imageSrc && (
        <div className="space-y-4">

          <div className="relative w-full h-64 bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
            />
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />

          <button
            onClick={uploadImage}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg"
          >
            Save Photo
          </button>

        </div>
      )}

    </div>
  );
}