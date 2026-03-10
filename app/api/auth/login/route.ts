import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logActivity } from "@/lib/activityLogger";

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

    // User not found
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔴 BLOCK DISABLED USERS
    if (user.active === false) {
      return NextResponse.json(
        { message: "Your account has been disabled by the administrator." },
        { status: 403 }
      );
    }

    // Check password exists
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

    // Log login activity
    await logActivity({
      userId: user._id.toString(),
      userName: user.name,
      role: user.role,
      action: "LOGIN",
      targetId: user._id.toString(),
      targetType: "user",
      message: `${user.name} logged into the system`,
    });

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