import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/roleGuard";

export async function POST(req: NextRequest) {

  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { userId, newPassword } = await req.json();

  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hashedPassword } }
  );

  return NextResponse.json({
    message: "Password reset successful"
  });
}