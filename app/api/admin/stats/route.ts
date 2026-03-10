import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/roleGuard";

export async function GET(req: NextRequest) {

  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  // USERS
  const totalUsers = await db.collection("users").countDocuments();
  const totalTeachers = await db.collection("users").countDocuments({ role: "teacher" });
  const totalPrincipals = await db.collection("users").countDocuments({ role: "principal" });

  // LEAVES
  const totalLeaves = await db.collection("leaves").countDocuments();
  const pendingLeaves = await db.collection("leaves").countDocuments({ status: "pending" });

  // ACTIVITY LOGS
  const recentActivity = await db
    .collection("activity_logs")
    .find({})
    .sort({ timestamp: -1 })
    .limit(20)
    .toArray();

  return NextResponse.json({
    stats: {
      totalUsers,
      totalTeachers,
      totalPrincipals,
      totalLeaves,
      pendingLeaves,
    },
    recentActivity
  });
}