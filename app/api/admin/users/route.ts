import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/roleGuard";
import { ObjectId } from "mongodb";
import { logActivity } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {

  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  const users = await db
    .collection("users")
    .find({})
    .project({
      password: 0
    })
    .toArray();

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, updates } = await req.json();

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const allowedUpdates: any = {};
    [
      "name",
      "email",
      "department",
      "phone",
      "designation",
      "qualification",
      "experience",
      "address",
      "bio",
      "role",
      "active",
    ].forEach((field) => {
      if (updates[field] !== undefined) allowedUpdates[field] = updates[field];
    });

    if (updates.leaveBalance) {
      allowedUpdates.leaveBalance = {
        CL: Number(updates.leaveBalance.CL || 0),
        VL: Number(updates.leaveBalance.VL || 0),
        OD: Number(updates.leaveBalance.OD || 0),
        DL: Number(updates.leaveBalance.DL || 0),
        CML: Number(updates.leaveBalance.CML || 0),
      };
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: allowedUpdates }
    );

    await logActivity({
      userId: auth.userId,
      userName: auth.userName || "Admin",
      role: "admin",
      action: "UPDATED_USER",
      targetId: userId,
      targetType: "user",
      message: "Admin updated user details",
    });

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("ADMIN USER UPDATE ERROR:", error);
    return NextResponse.json(
      { message: "Unable to update user." },
      { status: 500 }
    );
  }
}
