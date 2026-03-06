import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// GET ALL LEAVES FOR PRINCIPAL
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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

    const leaves = await db
      .collection("leaves")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "teacherId",
            foreignField: "_id",
            as: "teacher",
          },
        },
        { $unwind: "$teacher" },
        {
          $project: {
            fromDate: 1,
            toDate: 1,
            reason: 1,
            status: 1,
            createdAt: 1,
            "teacher.name": 1,
            "teacher.department": 1,
            "teacher.photo": 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Principal Leaves Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}