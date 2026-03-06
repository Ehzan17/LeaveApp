import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { requireRole } from "@/lib/roleGuard";

export async function POST(req: NextRequest) {
  // Allow only Admin
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, email, password, department } = await req.json();

    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
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
      department,
      role: "teacher",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Teacher created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}