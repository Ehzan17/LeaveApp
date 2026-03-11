import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { logActivity } from "@/lib/activityLogger";

/* =========================
   GET - Fetch User Leaves
========================= */
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

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const leaves = await db
      .collection("leaves")
      .find({
        userId: new ObjectId(decoded.userId),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("GET LEAVES ERROR:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   POST - Create Leave
========================= */
export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const { from, to, reason, leaveType, session } = await req.json();

    if (!from || !to || !reason) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const teacher = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    const department = teacher?.department || null;

    const courseType =
      department === "Physics" ||
      department === "Mathematics" ||
      department === "Chemistry" ||
      department === "Economics" ||
      department === "English" ||
      department === "Commerce"
        ? "aided"
        : "self_financing";

    const newLeave = {
      userId: new ObjectId(decoded.userId),
      teacherName: decoded.name,
      department,
      courseType,
      from,
      to,
      reason,
      leaveType,
      session,

      approvals: {
        principal: courseType === "aided" ? "pending" : null,
        sfCoordinator: courseType === "self_financing" ? "pending" : null,
        manager: courseType === "self_financing" ? "pending" : null,
      },

      status: "pending",
      createdAt: new Date(),
    };

    await db.collection("leaves").insertOne(newLeave);

    await logActivity({
      userId: decoded.userId,
      userName: decoded.name,
      role: decoded.role,
      action: "APPLIED_LEAVE",
      targetType: "leave",
      message: `${decoded.name} applied for leave from ${from} to ${to}`,
    });

    return NextResponse.json(
      { message: "Leave submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Leave Error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}