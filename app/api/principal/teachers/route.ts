import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/roleGuard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["principal", "admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const teachers = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            role: "teacher",
          },
        },
        {
          $lookup: {
            from: "leaves",
            localField: "_id",
            foreignField: "userId",
            as: "leaves",
          },
        },
        {
          $addFields: {
            totalLeaves: { $size: "$leaves" },
            pendingLeaves: {
              $size: {
                $filter: {
                  input: "$leaves",
                  as: "leave",
                  cond: { $eq: ["$$leave.status", "pending"] },
                },
              },
            },
            approvedLeaves: {
              $size: {
                $filter: {
                  input: "$leaves",
                  as: "leave",
                  cond: { $eq: ["$$leave.status", "approved"] },
                },
              },
            },
            rejectedLeaves: {
              $size: {
                $filter: {
                  input: "$leaves",
                  as: "leave",
                  cond: { $eq: ["$$leave.status", "rejected"] },
                },
              },
            },
          },
        },
        {
          $project: {
            password: 0,
            "leaves.teacher.password": 0,
          },
        },
        {
          $sort: {
            department: 1,
            name: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("PRINCIPAL TEACHERS ERROR:", error);
    return NextResponse.json(
      { message: "Unable to load teacher details." },
      { status: 500 }
    );
  }
}
