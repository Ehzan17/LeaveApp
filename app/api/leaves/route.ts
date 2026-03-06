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

    const userObjectId = new ObjectId(decoded.userId);

    const leaves = await db
      .collection("leaves")
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("GET Leaves Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
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

    const { from, to, reason } = await req.json();

    if (!from || !to || !reason) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const newLeave = {
      userId: new ObjectId(decoded.userId), // ✅ FIXED HERE
      from,
      to,
      reason,
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
