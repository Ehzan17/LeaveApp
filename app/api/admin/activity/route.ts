import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const logs = await db
      .collection("activity_logs")
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(logs);

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}