import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "profile_photos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { photo: uploadResult.secure_url } }
    );

    return NextResponse.json({
      message: "Photo uploaded successfully",
      photo: uploadResult.secure_url,
    });

  } catch (error: any) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { message: "Upload failed", error: error.message },
      { status: 500 }
    );
  }
}