import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    delete user.password;

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.log("No auth header");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    console.log("Decoded:", decoded);

    const userId = decoded.userId || decoded.id;

    if (!userId) {
      console.log("No userId in token");
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Body:", body);

    const updateData = {
      name: body.name,
      department: body.department,
      phone: body.phone,
      designation: body.designation,
      qualification: body.qualification,
      experience: body.experience,
      address: body.address,
      bio: body.bio,
    };

    console.log("Updating user:", userId);

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    return NextResponse.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("🔥 PUT PROFILE ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: String(error) },
      { status: 500 }
    );
  }
}