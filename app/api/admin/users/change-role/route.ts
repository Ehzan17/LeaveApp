import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/roleGuard";

export async function POST(req: NextRequest) {

  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { userId, role } = await req.json();

  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { role } }
  );

  return NextResponse.json({
    message: "Role updated successfully"
  });
}