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
  const approvedLeaves = await db.collection("leaves").countDocuments({ status: "approved" });
  const rejectedLeaves = await db.collection("leaves").countDocuments({ status: "rejected" });

  const leaves = await db
    .collection("leaves")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: 1,
          reason: 1,
          days: 1,
          from: 1,
          status: 1,
          teacherName: "$teacher.name",
        },
      },
    ])
    .toArray();

  const reasonCounts = new Map<string, number>();
  const monthCounts = new Map<string, number>();
  const usage = new Map<string, { teacherName: string; days: number; count: number }>();
  const riskAlerts: string[] = [];

  leaves.forEach((leave: any) => {
    const reason = leave.reason || "Not specified";
    reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);

    const month = new Date(leave.from).toLocaleString("en-US", { month: "long" });
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);

    const key = String(leave.userId);
    const current = usage.get(key) || {
      teacherName: leave.teacherName || "Unknown",
      days: 0,
      count: 0,
    };
    current.days += Number(leave.days || 0);
    current.count += 1;
    usage.set(key, current);
  });

  const topReason = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const peakMonth = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topUsers = [...usage.values()].sort((a, b) => b.days - a.days).slice(0, 5);
  const averageLeaveDays =
    usage.size > 0
      ? [...usage.values()].reduce((sum, item) => sum + item.days, 0) / usage.size
      : 0;

  topUsers
    .filter((user) => user.days >= 10)
    .forEach((user) => riskAlerts.push(`${user.teacherName} has used ${user.days} leave day(s)`));

  [...reasonCounts.entries()]
    .filter(([, count]) => count >= 3)
    .slice(0, 3)
    .forEach(([reason, count]) => riskAlerts.push(`Repeated reason "${reason}" appears ${count} times`));

  // ACTIVITY LOGS
  const recentActivity = await db
    .collection("activity_logs")
    .find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  return NextResponse.json({
    stats: {
      totalUsers,
      totalTeachers,
      totalPrincipals,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
    },
    insights: {
      mostFrequentReason: topReason
        ? { reason: topReason[0], count: topReason[1] }
        : null,
      peakLeaveMonth: peakMonth ? { month: peakMonth[0], count: peakMonth[1] } : null,
      averageLeaveDaysPerTeacher: Number(averageLeaveDays.toFixed(1)),
      highestLeaveUsage: topUsers,
    },
    riskAlerts,
    recentActivity
  });
}
