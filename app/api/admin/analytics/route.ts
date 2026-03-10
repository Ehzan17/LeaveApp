import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import User from "@/models/User";
import Leave from "@/models/Leave";

export async function GET() {
const client = await clientPromise;
const db = client.db("teacher_leave_portal");

  const totalTeachers = await User.countDocuments({ role: "teacher" });

  const totalLeaves = await Leave.countDocuments();

  const pendingLeaves = await Leave.countDocuments({
    status: "pending",
  });

  const rejectedLeaves = await Leave.countDocuments({
    status: "rejected",
  });

  return NextResponse.json({
    totalTeachers,
    totalLeaves,
    pendingLeaves,
    rejectedLeaves,
  });
}