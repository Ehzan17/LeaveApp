import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await context.params;

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    if (decoded.role !== "manager") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("teacher_leave_portal");

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid leave ID" },
        { status: 400 }
      );
    }

    const result = await db.collection("leaves").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "approvals.manager": "approved",
          status: "approved"
        }
      }
    );

    return NextResponse.json({
      message: "Leave approved by Manager",
      result
    });

  } catch (error) {

    console.error("MANAGER APPROVAL ERROR:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}