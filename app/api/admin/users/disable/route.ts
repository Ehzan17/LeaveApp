import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/roleGuard";

export async function POST(req: NextRequest) {

  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { userId } = await req.json();

  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  const user: any = await db.collection("users").findOne({
    _id: new ObjectId(userId)
  });

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  const newStatus = !user.active;

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { active: newStatus } }
  );

  return NextResponse.json({
    message: "User status updated",
    active: newStatus
  });
}