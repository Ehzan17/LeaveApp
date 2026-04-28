import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/roleGuard";
import { logActivity } from "@/lib/activityLogger";

const csvValue = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function buildRiskAlerts(leave: any, allLeaves: any[]) {
  const alerts: string[] = [];
  const teacherLeaves = allLeaves.filter(
    (item) => String(item.userId) === String(leave.userId)
  );
  const approvedDays = teacherLeaves
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + Number(item.days || 0), 0);
  const sameReasonCount = teacherLeaves.filter(
    (item) =>
      item.reason?.toLowerCase().trim() === leave.reason?.toLowerCase().trim()
  ).length;
  const from = new Date(leave.from);
  const day = from.getDay();

  if (approvedDays >= 10) alerts.push("High leave usage");
  if (day === 1 || day === 5) alerts.push("Near weekend/holiday window");
  if (sameReasonCount >= 3) alerts.push("Repeated same reason");

  return alerts;
}

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.toLowerCase().trim() || "";
    const status = url.searchParams.get("status") || "all";
    const leaveType = url.searchParams.get("leaveType") || "all";
    const department = url.searchParams.get("department") || "all";
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const exportType = url.searchParams.get("export");

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const allLeaves = await db
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
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            userId: 1,
            from: 1,
            to: 1,
            reason: 1,
            leaveType: 1,
            days: 1,
            status: 1,
            approvals: 1,
            courseType: 1,
            session: 1,
            createdAt: 1,
            department: "$teacher.department",
            teacherName: "$teacher.name",
            teacherEmail: "$teacher.email",
          },
        },
      ])
      .toArray();

    const leaves = allLeaves
      .filter((leave: any) => {
        const leaveFrom = new Date(leave.from);
        const matchesSearch =
          !search || leave.teacherName?.toLowerCase().includes(search);
        const matchesStatus = status === "all" || leave.status === status;
        const matchesType = leaveType === "all" || leave.leaveType === leaveType;
        const matchesDept = department === "all" || leave.department === department;
        const matchesFrom = !fromDate || leaveFrom >= new Date(fromDate);
        const matchesTo = !toDate || leaveFrom <= new Date(toDate);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType &&
          matchesDept &&
          matchesFrom &&
          matchesTo
        );
      })
      .map((leave: any) => ({
        ...leave,
        riskAlerts: buildRiskAlerts(leave, allLeaves),
      }));

    if (exportType === "csv") {
      const rows = [
        ["Teacher", "Department", "From", "To", "Type", "Days", "Status", "Reason"],
        ...leaves.map((leave: any) => [
          leave.teacherName,
          leave.department,
          leave.from,
          leave.to,
          leave.leaveType,
          leave.days,
          leave.status,
          leave.reason,
        ]),
      ];
      const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=leaves.csv",
        },
      });
    }

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error("ADMIN LEAVES ERROR:", error);
    return NextResponse.json(
      { message: "Unable to load leave records." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { ids, status } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "Select at least one leave request." },
        { status: 400 }
      );
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { message: "Invalid status." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");
    const objectIds = ids.filter(ObjectId.isValid).map((id) => new ObjectId(id));

    const result = await db.collection("leaves").updateMany(
      { _id: { $in: objectIds }, status: "pending" },
      {
        $set: {
          status,
          "approvals.admin": status,
          reviewedBy: auth.userId,
          reviewedAt: new Date(),
        },
      }
    );

    await logActivity({
      userId: auth.userId,
      userName: auth.userName || "Admin",
      role: "admin",
      action: status === "approved" ? "BULK_APPROVED_LEAVES" : "BULK_REJECTED_LEAVES",
      targetType: "leave",
      message: `${status === "approved" ? "Approved" : "Rejected"} ${
        result.modifiedCount
      } leave request(s) in bulk`,
    });

    return NextResponse.json({
      message: `${result.modifiedCount} leave request(s) updated`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("ADMIN BULK LEAVES ERROR:", error);
    return NextResponse.json(
      { message: "Unable to update selected leaves." },
      { status: 500 }
    );
  }
}
