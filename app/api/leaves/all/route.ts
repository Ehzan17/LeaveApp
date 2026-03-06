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

    if (decoded.role !== "principal") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const leaves = await db
      .collection("leaves")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "teacher"
          }
        },
        { $unwind: "$teacher" },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            from: 1,
            to: 1,
            reason: 1,
            status: 1,
            teacherName: "$teacher.name",
            teacherEmail: "$teacher.email",
            teacherDepartment: "$teacher.department",
            teacherPhoto: "$teacher.photo"
          }
        }
      ])
      .toArray();

    return NextResponse.json(leaves);

  } catch (error) {
    console.error("ALL LEAVES ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: String(error) },
      { status: 500 }
    );
  }
}