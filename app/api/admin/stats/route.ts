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

    const totalUsers = await db.collection("users").countDocuments();
    const totalTeachers = await db.collection("users").countDocuments({ role: "teacher" });
    const totalPrincipals = await db.collection("users").countDocuments({ role: "principal" });
    const totalLeaves = await db.collection("leaves").countDocuments();
    const pendingLeaves = await db.collection("leaves").countDocuments({ status: "pending" });

    const recentActivity = await db.collection("leaves")
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTeachers,
        totalPrincipals,
        totalLeaves,
        pendingLeaves,
      },
      recentActivity: recentActivity.map(l => ({
        message: `Leave from ${l.from} to ${l.to} is ${l.status}`
      }))
    });

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}