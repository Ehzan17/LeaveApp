import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { requireRole } from "@/lib/roleGuard";

export async function POST(req: NextRequest) {

  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { name, email, password, role, department } = body;

  const client = await clientPromise;
  const db = client.db("teacher_leave_portal");

  const existing = await db.collection("users").findOne({ email });

  if (existing) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.collection("users").insertOne({
    name,
    email,
    password: hashedPassword,
    role,
    department: role === "teacher" ? department : null,
    active: true,
    createdAt: new Date()
  });

  return NextResponse.json({
    message: "User created successfully"
  });
}