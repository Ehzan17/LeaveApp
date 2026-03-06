import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest) {
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

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({
      message: "Password updated successfully",
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error: String(error) },
      { status: 500 }
    );
  }
}