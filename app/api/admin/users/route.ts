import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/roleGuard";

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