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
      { message: "Unable to load leave requests. Please try again." },
      { status: 500 }
    );
  }
}
/* =========================
   POST - Create Leave (UPGRADED)
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

    if (!from || !to || !reason || !leaveType || !session) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const teacher = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const department = teacher.department || null;

    const courseType =
      ["Physics", "Mathematics", "Chemistry", "Economics", "English", "Commerce"].includes(department)
        ? "aided"
        : "self_financing";

    /* =========================
       🧠 CALCULATE LEAVE DAYS
    ========================= */

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate > toDate) {
      return NextResponse.json(
        { message: "Invalid date range" },
        { status: 400 }
      );
    }

    // total days
// total days (base)
let totalDays =
  (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24) + 1;

// normalize
totalDays = Math.floor(totalDays);

// session logic
if (fromDate.getTime() === toDate.getTime()) {
  // SAME DAY
  if (session === "full_day") {
    totalDays = 1;
  } else {
    totalDays = 0.5;
  }
} else {
  // MULTI DAY

  if (session === "full_day") {
    // no change
  } else {
    // FN or AN → subtract half day
    totalDays = totalDays - 0.5;
  }
}
   /* =========================
   🧠 CHECK LEAVE BALANCE
========================= */

const balance = teacher.leaveBalance || {};

// ✅ Step 1: Check if leave type exists
if (balance[leaveType] === undefined) {
  return NextResponse.json(
    { message: "Invalid leave type" },
    { status: 400 }
  );
}

// ✅ Step 2: Check if balance is 0 or not enough
if (balance[leaveType] <= 0) {
  return NextResponse.json(
    { message: `No ${leaveType} leaves left` },
    { status: 400 }
  );
}

if (balance[leaveType] < totalDays) {
  return NextResponse.json(
    { message: "Insufficient leave balance" },
    { status: 400 }
  );
}
    /* =========================
       CREATE LEAVE
    ========================= */

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
      days: totalDays, // ✅ NEW FIELD

      approvals:
        courseType === "aided"
          ? { principal: "pending" }
          : {
              sfCoordinator: "pending",
              manager: "pending",
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
      message: `${decoded.name} applied ${leaveType} for ${totalDays} day(s)`,
    });

    return NextResponse.json(
      { message: "Leave submitted successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Leave Error:", error);

    return NextResponse.json(
      { message: "Unable to submit leave request. Please try again." },
      { status: 500 }
    );
  }
}
