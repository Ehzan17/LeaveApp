import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const user: any = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔴 ensure password exists
    if (!user.password) {
      return NextResponse.json(
        { message: "User password missing in database" },
        { status: 500 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name
    });

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error.message || String(error)
      },
      { status: 500 }
    );
  }
}